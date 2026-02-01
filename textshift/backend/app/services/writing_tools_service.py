"""
Writing Tools Service - Phase 4 Feature Expansion
Implements 14 new writing/content tools with tier-based gating.

Features:
1. Grammar Checker - LanguageTool API
2. Tone Detector - RoBERTa model (local)
3. Tone Adjuster - T5 model (local)
4. Readability Score - Python textstat
5. Summarizer - T5 model (local)
6. Paraphraser - T5 model (local)
7. Citation Generator - CrossRef API
8. Word Counter - Pure Python
9. Translator - Helsinki-NLP models (local)
10. Export Options - Python libraries
11. Bulk Processing - Loop processing
12. API Access - FastAPI endpoints
13. Style Analysis - Python nltk
14. Content Improver - T5 model (local)
"""

import os
import re
import json
import httpx
import asyncio
import logging
import boto3
import torch
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
from collections import Counter
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    T5Tokenizer, 
    T5ForConditionalGeneration,
    MarianMTModel,
    MarianTokenizer
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class WritingToolsService:
    """Service for all writing tools features."""
    
    _instance = None
    _tone_model = None
    _tone_tokenizer = None
    _translator_models: Dict[str, Tuple[Any, Any]] = {}
    _t5_model = None
    _t5_tokenizer = None
    _general_t5_model = None
    _general_t5_tokenizer = None
    _grammar_model = None
    _grammar_tokenizer = None
    
    # Tone labels from SamLowe/roberta-base-go_emotions
    TONE_LABELS = [
        'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring',
        'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval',
        'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief',
        'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization',
        'relief', 'remorse', 'sadness', 'surprise', 'neutral'
    ]
    
    # Supported translation language pairs
    SUPPORTED_LANGUAGES = {
        'en-es': 'English to Spanish',
        'es-en': 'Spanish to English',
        'en-fr': 'English to French',
        'fr-en': 'French to English',
        'en-de': 'English to German',
        'de-en': 'German to English',
        'en-hi': 'English to Hindi',
    }
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _get_s3_client(self):
        """Get S3 client for iDrive e2."""
        return boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY
        )
    
    def _download_model_from_s3(self, s3_prefix: str, local_dir: str) -> bool:
        """Download model from iDrive e2 to local directory."""
        try:
            if os.path.exists(local_dir) and os.listdir(local_dir):
                logger.info(f"Model already exists at {local_dir}")
                return True
            
            os.makedirs(local_dir, exist_ok=True)
            s3 = self._get_s3_client()
            
            paginator = s3.get_paginator('list_objects_v2')
            for page in paginator.paginate(Bucket=settings.S3_BUCKET, Prefix=s3_prefix):
                for obj in page.get('Contents', []):
                    key = obj['Key']
                    # Skip cache files
                    if '.cache' in key:
                        continue
                    relative_path = key[len(s3_prefix):].lstrip('/')
                    if not relative_path:
                        continue
                    local_path = os.path.join(local_dir, relative_path)
                    os.makedirs(os.path.dirname(local_path), exist_ok=True)
                    logger.info(f"Downloading {key} to {local_path}")
                    s3.download_file(settings.S3_BUCKET, key, local_path)
            
            return True
        except Exception as e:
            logger.error(f"Failed to download model from S3: {e}")
            return False
    
    def _load_tone_model(self):
        """Load tone detection model (SamLowe/roberta-base-go_emotions)."""
        if self._tone_model is not None:
            return
        
        try:
            model_dir = os.path.join(settings.MODELS_DIR, 'tone-detector')
            
            # Download from iDrive if not present
            if not os.path.exists(model_dir) or not os.listdir(model_dir):
                self._download_model_from_s3('textshift-models/tone-detector/', model_dir)
            
            self._tone_tokenizer = AutoTokenizer.from_pretrained(model_dir)
            self._tone_model = AutoModelForSequenceClassification.from_pretrained(model_dir)
            self._tone_model.eval()
            logger.info("Tone detection model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load tone model: {e}")
            # Fallback to HuggingFace
            try:
                self._tone_tokenizer = AutoTokenizer.from_pretrained("SamLowe/roberta-base-go_emotions")
                self._tone_model = AutoModelForSequenceClassification.from_pretrained("SamLowe/roberta-base-go_emotions")
                self._tone_model.eval()
                logger.info("Tone model loaded from HuggingFace")
            except Exception as e2:
                logger.error(f"Failed to load tone model from HuggingFace: {e2}")
    
    def _load_translator_model(self, lang_pair: str):
        """Load translation model for a specific language pair."""
        if lang_pair in self._translator_models:
            return
        
        try:
            model_dir = os.path.join(settings.MODELS_DIR, f'translator-{lang_pair}')
            
            # Download from iDrive if not present
            if not os.path.exists(model_dir) or not os.listdir(model_dir):
                self._download_model_from_s3(f'textshift-models/translator-{lang_pair}/', model_dir)
            
            tokenizer = MarianTokenizer.from_pretrained(model_dir)
            model = MarianMTModel.from_pretrained(model_dir)
            model.eval()
            self._translator_models[lang_pair] = (tokenizer, model)
            logger.info(f"Translator model {lang_pair} loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load translator model {lang_pair}: {e}")
            # Fallback to HuggingFace
            try:
                hf_model = f"Helsinki-NLP/opus-mt-{lang_pair}"
                tokenizer = MarianTokenizer.from_pretrained(hf_model)
                model = MarianMTModel.from_pretrained(hf_model)
                model.eval()
                self._translator_models[lang_pair] = (tokenizer, model)
                logger.info(f"Translator model {lang_pair} loaded from HuggingFace")
            except Exception as e2:
                logger.error(f"Failed to load translator from HuggingFace: {e2}")
    
    def _load_t5_model(self):
        """Load T5 model for summarization, paraphrasing, tone adjustment, content improvement."""
        if self._t5_model is not None:
            return
        
        try:
            # Use the existing humanizer model (T5-base)
            model_dir = settings.HUMANIZER_MODEL_PATH
            if os.path.exists(model_dir):
                self._t5_tokenizer = T5Tokenizer.from_pretrained(model_dir)
                self._t5_model = T5ForConditionalGeneration.from_pretrained(model_dir)
            else:
                # Fallback to base T5
                self._t5_tokenizer = T5Tokenizer.from_pretrained("t5-base")
                self._t5_model = T5ForConditionalGeneration.from_pretrained("t5-base")
            self._t5_model.eval()
            logger.info("T5 model loaded for writing tools")
        except Exception as e:
            logger.error(f"Failed to load T5 model: {e}")
    
    def _load_general_t5_model(self):
        """Load general-purpose Flan-T5 model for writing tasks (summarization, paraphrasing, etc.)."""
        if self._general_t5_model is not None:
            return True
        
        try:
            model_dir = os.path.join(settings.MODELS_DIR, 'flan-t5-base')
            
            # Download from iDrive if not present
            if not os.path.exists(model_dir) or not os.listdir(model_dir):
                success = self._download_model_from_s3('textshift-models/flan-t5-base/', model_dir)
                if not success:
                    # Fallback to HuggingFace
                    logger.info("Downloading flan-t5-base from HuggingFace...")
                    self._general_t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
                    self._general_t5_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")
                    self._general_t5_model.eval()
                    logger.info("Flan-T5 model loaded from HuggingFace")
                    return True
            
            self._general_t5_tokenizer = T5Tokenizer.from_pretrained(model_dir)
            self._general_t5_model = T5ForConditionalGeneration.from_pretrained(model_dir)
            self._general_t5_model.eval()
            logger.info("Flan-T5 model loaded successfully from local storage")
            return True
        except Exception as e:
            logger.error(f"Failed to load Flan-T5 model: {e}")
            return False
    
    def _load_grammar_model(self):
        """Load T5 grammar correction model from iDrive e2."""
        if self._grammar_model is not None:
            return True
        
        try:
            model_dir = os.path.join(settings.MODELS_DIR, 't5-grammar-correction')
            
            # Download from iDrive if not present
            if not os.path.exists(model_dir) or not os.listdir(model_dir):
                success = self._download_model_from_s3('grammar-checker/t5-base-grammar-correction/', model_dir)
                if not success:
                    # Fallback to HuggingFace
                    logger.info("Downloading t5-base-grammar-correction from HuggingFace...")
                    self._grammar_tokenizer = T5Tokenizer.from_pretrained("vennify/t5-base-grammar-correction")
                    self._grammar_model = T5ForConditionalGeneration.from_pretrained("vennify/t5-base-grammar-correction")
                    self._grammar_model.eval()
                    logger.info("Grammar T5 model loaded from HuggingFace")
                    return True
            
            self._grammar_tokenizer = T5Tokenizer.from_pretrained(model_dir)
            self._grammar_model = T5ForConditionalGeneration.from_pretrained(model_dir)
            self._grammar_model.eval()
            logger.info("Grammar T5 model loaded successfully from local storage")
            return True
        except Exception as e:
            logger.error(f"Failed to load Grammar T5 model: {e}")
            return False
    
    def _correct_grammar_with_t5(self, text: str) -> Optional[str]:
        """Correct grammar using T5 model."""
        try:
            if not self._load_grammar_model():
                return None
            
            if self._grammar_model is None or self._grammar_tokenizer is None:
                return None
            
            # T5 grammar model expects "grammar: " prefix
            input_text = f"grammar: {text}"
            
            inputs = self._grammar_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._grammar_model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=5,
                    early_stopping=True
                )
            
            corrected_text = self._grammar_tokenizer.decode(outputs[0], skip_special_tokens=True)
            return corrected_text.strip() if corrected_text else None
        except Exception as e:
            logger.error(f"T5 grammar correction failed: {e}")
            return None
    
    def _generate_with_t5(self, prompt: str, max_length: int = 256, min_length: int = 10) -> Optional[str]:
        """Generate text using Flan-T5 model with error handling."""
        try:
            if not self._load_general_t5_model():
                return None
            
            if self._general_t5_model is None or self._general_t5_tokenizer is None:
                return None
            
            inputs = self._general_t5_tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._general_t5_model.generate(
                    **inputs,
                    max_length=max_length,
                    min_length=min_length,
                    num_beams=4,
                    length_penalty=1.0,
                    early_stopping=True,
                    do_sample=False
                )
            
            generated_text = self._general_t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Validate output - should not be empty or just the prompt
            if not generated_text or len(generated_text.strip()) < 5:
                return None
            if generated_text.strip().lower() == prompt.strip().lower():
                return None
            
            return generated_text.strip()
        except Exception as e:
            logger.error(f"T5 generation failed: {e}")
            return None
    
    # ==================== Feature 1: Grammar Checker ====================
    def _find_differences(self, original: str, corrected: str) -> List[Dict[str, Any]]:
        """Find word-level differences between original and corrected text."""
        import difflib
        
        errors = []
        original_words = original.split()
        corrected_words = corrected.split()
        
        matcher = difflib.SequenceMatcher(None, original_words, corrected_words)
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'replace':
                original_segment = ' '.join(original_words[i1:i2])
                corrected_segment = ' '.join(corrected_words[j1:j2])
                errors.append({
                    "message": f"Replace '{original_segment}' with '{corrected_segment}'",
                    "short_message": "Grammar/Spelling",
                    "original": original_segment,
                    "replacement": corrected_segment,
                    "rule_category": "Grammar Correction",
                    "replacements": [corrected_segment]
                })
            elif tag == 'delete':
                original_segment = ' '.join(original_words[i1:i2])
                errors.append({
                    "message": f"Remove '{original_segment}'",
                    "short_message": "Unnecessary word(s)",
                    "original": original_segment,
                    "replacement": "",
                    "rule_category": "Grammar Correction",
                    "replacements": [""]
                })
            elif tag == 'insert':
                corrected_segment = ' '.join(corrected_words[j1:j2])
                errors.append({
                    "message": f"Insert '{corrected_segment}'",
                    "short_message": "Missing word(s)",
                    "original": "",
                    "replacement": corrected_segment,
                    "rule_category": "Grammar Correction",
                    "replacements": [corrected_segment]
                })
        
        return errors
    
    async def check_grammar(self, text: str) -> Dict[str, Any]:
        """Check grammar using T5 model (primary) + LanguageTool API (supplementary)."""
        try:
            errors = []
            corrected_text = text
            
            # Step 1: Use T5 grammar model for correction (primary)
            t5_corrected = self._correct_grammar_with_t5(text)
            
            if t5_corrected and t5_corrected != text:
                corrected_text = t5_corrected
                # Find differences between original and T5 corrected
                t5_errors = self._find_differences(text, t5_corrected)
                errors.extend(t5_errors)
            
            # Step 2: Also run LanguageTool for additional error explanations
            lt_errors = []
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.languagetool.org/v2/check",
                        data={
                            "text": text,
                            "language": "en-US",
                            "enabledOnly": "false"
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        matches = data.get("matches", [])
                        
                        for match in matches:
                            lt_error = {
                                "message": match.get("message", ""),
                                "short_message": match.get("shortMessage", ""),
                                "offset": match.get("offset", 0),
                                "length": match.get("length", 0),
                                "context": match.get("context", {}).get("text", ""),
                                "rule_id": match.get("rule", {}).get("id", ""),
                                "rule_category": match.get("rule", {}).get("category", {}).get("name", ""),
                                "replacements": [r.get("value", "") for r in match.get("replacements", [])[:3]]
                            }
                            lt_errors.append(lt_error)
            except Exception as lt_e:
                logger.warning(f"LanguageTool API failed (using T5 only): {lt_e}")
            
            # Merge errors - avoid duplicates by checking if correction already exists
            existing_corrections = {e.get("replacement", "").lower() for e in errors}
            for lt_error in lt_errors:
                if lt_error["replacements"]:
                    replacement = lt_error["replacements"][0].lower()
                    if replacement not in existing_corrections:
                        errors.append(lt_error)
                        existing_corrections.add(replacement)
            
            return {
                "success": True,
                "original_text": text,
                "corrected_text": corrected_text,
                "error_count": len(errors),
                "errors": errors,
                "language": "en-US",
                "model": "T5-grammar-correction + LanguageTool"
            }
        except Exception as e:
            logger.error(f"Grammar check failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 2: Tone Detector ====================
    def detect_tone(self, text: str) -> Dict[str, Any]:
        """Detect emotional tone using RoBERTa model."""
        try:
            self._load_tone_model()
            
            if self._tone_model is None:
                return {"success": False, "error": "Tone model not available"}
            
            inputs = self._tone_tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._tone_model(**inputs)
                probs = torch.sigmoid(outputs.logits)[0]
            
            # Get top 5 tones
            top_indices = torch.argsort(probs, descending=True)[:5]
            tones = []
            for idx in top_indices:
                tone_name = self.TONE_LABELS[idx.item()]
                confidence = round(probs[idx].item() * 100, 2)
                if confidence > 5:  # Only include if > 5%
                    tones.append({
                        "tone": tone_name,
                        "confidence": confidence
                    })
            
            primary_tone = tones[0] if tones else {"tone": "neutral", "confidence": 100}
            
            return {
                "success": True,
                "primary_tone": primary_tone["tone"],
                "primary_confidence": primary_tone["confidence"],
                "all_tones": tones,
                "text_preview": text[:100] + "..." if len(text) > 100 else text
            }
        except Exception as e:
            logger.error(f"Tone detection failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 3: Tone Adjuster ====================
    def adjust_tone(self, text: str, target_tone: str) -> Dict[str, Any]:
        """Adjust text tone using comprehensive rule-based transformation."""
        try:
            import random
            adjusted_text = text
            target = target_tone.lower()
            
            # Aggressive/negative phrase replacements for formal tone
            aggressive_to_formal = {
                "dropped the ball": "encountered challenges",
                "clean up your mess": "address the issues",
                "I'm sick of it": "this situation requires attention",
                "sick of it": "concerned about this pattern",
                "frankly": "to be direct",
                "maybe you're in the wrong job": "we should discuss role alignment",
                "in the wrong job": "may benefit from additional support or role review",
                "can't handle": "are experiencing difficulty with",
                "completely dropped": "did not meet expectations on",
                "your mess": "these issues",
                "incompetence": "performance gaps",
                "unacceptable": "below expectations",
                "ridiculous": "concerning",
                "stupid": "ineffective",
                "terrible": "unsatisfactory",
                "awful": "suboptimal",
                "hate": "have concerns about",
                "angry": "disappointed",
                "furious": "deeply concerned",
                "fed up": "concerned about the recurring nature of",
                "screwed up": "made errors in",
                "messed up": "encountered issues with",
                "failed miserably": "did not achieve the expected outcomes",
                "waste of time": "inefficient use of resources",
                "useless": "not meeting current needs",
                "pathetic": "inadequate",
                "disaster": "significant challenge",
                "catastrophe": "serious issue",
                "blame": "identify areas for improvement regarding",
                "fault": "responsibility",
                "you always": "there has been a pattern of",
                "you never": "there have been instances where",
                "this is the third time": "we have encountered this situation multiple times",
            }
            
            # Formal tone transformations (contractions + professional language)
            formal_replacements = {
                "can't": "cannot", "won't": "will not", "don't": "do not",
                "isn't": "is not", "aren't": "are not", "wasn't": "was not",
                "weren't": "were not", "hasn't": "has not", "haven't": "have not",
                "hadn't": "had not", "doesn't": "does not", "didn't": "did not",
                "couldn't": "could not", "shouldn't": "should not", "wouldn't": "would not",
                "I'm": "I am", "you're": "you are", "we're": "we are", "they're": "they are",
                "it's": "it is", "that's": "that is", "there's": "there is",
                "what's": "what is", "who's": "who is", "let's": "let us",
                "gonna": "going to", "wanna": "want to", "gotta": "got to",
                "kinda": "kind of", "sorta": "sort of", "dunno": "do not know",
                "yeah": "yes", "nope": "no", "yep": "yes", "ok": "acceptable",
                "awesome": "excellent", "cool": "satisfactory", "great": "excellent",
                "stuff": "materials", "things": "items", "guy": "individual",
                "guys": "individuals", "kids": "children", "lots": "numerous",
                "a lot": "significantly", "pretty": "quite", "really": "very",
                "super": "extremely", "totally": "completely", "basically": "fundamentally",
            }
            
            # Casual tone transformations
            casual_replacements = {
                "cannot": "can't", "will not": "won't", "do not": "don't",
                "is not": "isn't", "are not": "aren't", "was not": "wasn't",
                "were not": "weren't", "has not": "hasn't", "have not": "haven't",
                "had not": "hadn't", "does not": "doesn't", "did not": "didn't",
                "could not": "couldn't", "should not": "shouldn't", "would not": "wouldn't",
                "I am": "I'm", "you are": "you're", "we are": "we're", "they are": "they're",
                "it is": "it's", "that is": "that's", "there is": "there's",
                "excellent": "awesome", "satisfactory": "cool", "individuals": "folks",
                "children": "kids", "numerous": "lots of", "significantly": "a lot",
                "extremely": "super", "completely": "totally", "fundamentally": "basically",
                "however": "but", "therefore": "so", "furthermore": "also",
                "nevertheless": "still", "consequently": "so", "additionally": "plus",
                "regarding": "about", "concerning": "about", "approximately": "around",
                "sufficient": "enough", "commence": "start", "terminate": "end",
                "utilize": "use", "facilitate": "help", "implement": "do",
            }
            
            # Academic tone transformations
            academic_replacements = {
                "show": "demonstrate", "think": "hypothesize", "use": "utilize",
                "find": "discover", "look at": "examine", "get": "obtain",
                "give": "provide", "make": "construct", "help": "facilitate",
                "need": "require", "want": "desire", "try": "attempt",
                "big": "substantial", "small": "minimal", "good": "beneficial",
                "bad": "detrimental", "important": "significant", "interesting": "noteworthy",
                "about": "regarding", "because": "due to the fact that",
                "but": "however", "so": "therefore", "also": "furthermore",
                "start": "commence", "end": "conclude", "change": "modify",
            }
            
            # Confident tone transformations
            confident_replacements = {
                "I think": "I know", "maybe": "certainly", "perhaps": "definitely",
                "might": "will", "could": "can", "possibly": "absolutely",
                "I believe": "I am confident that", "I hope": "I expect",
                "I guess": "I am certain", "probably": "undoubtedly",
                "it seems": "it is clear", "apparently": "evidently",
                "it might be": "it is", "we could try": "we will",
                "if possible": "when we", "hopefully": "certainly",
            }
            
            # Persuasive tone additions
            persuasive_phrases = {
                "start": ["Imagine ", "Picture this: ", "Consider how "],
                "emphasis": [" - and this is crucial - ", " - importantly - ", " - notably - "],
                "call_to_action": [" Take action now.", " Don't miss this opportunity.", " Act today."],
            }
            
            # Empathetic tone transformations
            empathetic_phrases = {
                "start": ["I understand that ", "I hear you - ", "I can see how "],
                "validation": [" and that's completely valid", " which makes total sense", " and your feelings matter"],
            }
            
            if target == "formal":
                # First, replace aggressive phrases with professional alternatives
                for old, new in aggressive_to_formal.items():
                    adjusted_text = re.sub(re.escape(old), new, adjusted_text, flags=re.IGNORECASE)
                
                # Then expand contractions and use formal vocabulary
                for old, new in formal_replacements.items():
                    adjusted_text = re.sub(r'\b' + re.escape(old) + r'\b', new, adjusted_text, flags=re.IGNORECASE)
                
                # Add professional framing if text starts with aggressive "Your" or "You"
                if adjusted_text.lower().startswith("your team") or adjusted_text.lower().startswith("you "):
                    adjusted_text = "I would like to discuss some concerns. " + adjusted_text
                
                # Soften direct accusations
                adjusted_text = re.sub(r'\bYour team\b', 'The team', adjusted_text)
                adjusted_text = re.sub(r'\byour team\b', 'the team', adjusted_text)
            
            elif target == "casual":
                for old, new in casual_replacements.items():
                    adjusted_text = re.sub(r'\b' + re.escape(old) + r'\b', new, adjusted_text, flags=re.IGNORECASE)
                
                # Add casual opener if formal
                if adjusted_text.startswith(("Dear ", "To Whom", "I am writing")):
                    adjusted_text = "Hey! " + adjusted_text
            
            elif target == "persuasive":
                # Add persuasive opening
                if not adjusted_text.startswith(tuple(persuasive_phrases["start"])):
                    adjusted_text = random.choice(persuasive_phrases["start"]) + adjusted_text[0].lower() + adjusted_text[1:]
                # Add call to action if not present
                if not adjusted_text.rstrip().endswith(('.', '!', '?')):
                    adjusted_text += "."
                adjusted_text = adjusted_text.rstrip('.!?') + random.choice(persuasive_phrases["call_to_action"])
            
            elif target == "academic":
                for old, new in academic_replacements.items():
                    adjusted_text = re.sub(r'\b' + re.escape(old) + r'\b', new, adjusted_text, flags=re.IGNORECASE)
                # Add academic structure
                if not adjusted_text.startswith(("This ", "The ", "In ", "According ", "Research ")):
                    adjusted_text = "This analysis suggests that " + adjusted_text[0].lower() + adjusted_text[1:]
            
            elif target == "confident":
                for old, new in confident_replacements.items():
                    adjusted_text = re.sub(r'\b' + re.escape(old) + r'\b', new, adjusted_text, flags=re.IGNORECASE)
                # Remove hedging language
                adjusted_text = re.sub(r'\b(sort of|kind of|a bit|somewhat)\b', '', adjusted_text, flags=re.IGNORECASE)
                adjusted_text = re.sub(r'\s+', ' ', adjusted_text).strip()
            
            elif target == "empathetic":
                # Add empathetic opening
                if not any(adjusted_text.startswith(phrase) for phrase in empathetic_phrases["start"]):
                    adjusted_text = random.choice(empathetic_phrases["start"]) + adjusted_text[0].lower() + adjusted_text[1:]
                # Soften harsh language
                adjusted_text = re.sub(r'\bmust\b', 'could', adjusted_text, flags=re.IGNORECASE)
                adjusted_text = re.sub(r'\bshould\b', 'might want to', adjusted_text, flags=re.IGNORECASE)
            
            return {
                "success": True,
                "original_text": text,
                "adjusted_text": adjusted_text,
                "target_tone": target_tone,
                "word_count_original": len(text.split()),
                "word_count_adjusted": len(adjusted_text.split()),
                "transformation_applied": target
            }
        except Exception as e:
            logger.error(f"Tone adjustment failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 4: Readability Score ====================
    def analyze_readability(self, text: str, detailed: bool = False) -> Dict[str, Any]:
        """Analyze text readability using various metrics."""
        try:
            words = text.split()
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            word_count = len(words)
            sentence_count = len(sentences) if sentences else 1
            char_count = len(text.replace(" ", ""))
            
            # Average word length
            avg_word_length = char_count / word_count if word_count > 0 else 0
            
            # Average sentence length
            avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
            
            # Count syllables (simplified)
            def count_syllables(word):
                word = word.lower()
                vowels = "aeiouy"
                count = 0
                prev_vowel = False
                for char in word:
                    is_vowel = char in vowels
                    if is_vowel and not prev_vowel:
                        count += 1
                    prev_vowel = is_vowel
                return max(1, count)
            
            total_syllables = sum(count_syllables(w) for w in words)
            avg_syllables_per_word = total_syllables / word_count if word_count > 0 else 0
            
            # Flesch Reading Ease
            flesch_ease = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
            flesch_ease = max(0, min(100, flesch_ease))
            
            # Flesch-Kincaid Grade Level
            fk_grade = (0.39 * avg_sentence_length) + (11.8 * avg_syllables_per_word) - 15.59
            fk_grade = max(0, fk_grade)
            
            # Gunning Fog Index
            complex_words = sum(1 for w in words if count_syllables(w) >= 3)
            fog_index = 0.4 * (avg_sentence_length + 100 * (complex_words / word_count if word_count > 0 else 0))
            
            # Reading level interpretation
            if flesch_ease >= 90:
                reading_level = "Very Easy (5th grade)"
            elif flesch_ease >= 80:
                reading_level = "Easy (6th grade)"
            elif flesch_ease >= 70:
                reading_level = "Fairly Easy (7th grade)"
            elif flesch_ease >= 60:
                reading_level = "Standard (8th-9th grade)"
            elif flesch_ease >= 50:
                reading_level = "Fairly Difficult (10th-12th grade)"
            elif flesch_ease >= 30:
                reading_level = "Difficult (College)"
            else:
                reading_level = "Very Difficult (College Graduate)"
            
            result = {
                "success": True,
                "flesch_reading_ease": round(flesch_ease, 1),
                "reading_level": reading_level,
                "word_count": word_count,
                "sentence_count": sentence_count
            }
            
            if detailed:
                result.update({
                    "flesch_kincaid_grade": round(fk_grade, 1),
                    "gunning_fog_index": round(fog_index, 1),
                    "avg_sentence_length": round(avg_sentence_length, 1),
                    "avg_word_length": round(avg_word_length, 1),
                    "avg_syllables_per_word": round(avg_syllables_per_word, 2),
                    "complex_word_count": complex_words,
                    "complex_word_percentage": round(100 * complex_words / word_count if word_count > 0 else 0, 1),
                    "character_count": char_count,
                    "total_syllables": total_syllables
                })
            
            return result
        except Exception as e:
            logger.error(f"Readability analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 5: Summarizer ====================
    def summarize(self, text: str, max_length: int = 150, min_length: int = 50) -> Dict[str, Any]:
        """Summarize text using T5 model with extractive summarization fallback."""
        try:
            used_t5 = False
            summary = None
            
            # Try T5 model first
            t5_prompt = f"Summarize the following text: {text}"
            t5_result = self._generate_with_t5(t5_prompt, max_length=max_length, min_length=min_length)
            
            if t5_result and len(t5_result) > 10 and len(t5_result) < len(text):
                summary = t5_result
                used_t5 = True
                logger.info("Summarization using T5 model successful")
                
                original_words = len(text.split())
                summary_words = len(summary.split())
                compression_ratio = round((1 - summary_words / original_words) * 100, 1) if original_words > 0 else 0
                
                return {
                    "success": True,
                    "original_text": text[:500] + "..." if len(text) > 500 else text,
                    "summary": summary,
                    "original_word_count": original_words,
                    "summary_word_count": summary_words,
                    "compression_ratio": compression_ratio,
                    "used_t5": used_t5
                }
            
            # Fallback to extractive summarization
            logger.info("Falling back to extractive summarization")
            
            # Split into sentences
            sentences = re.split(r'(?<=[.!?])\s+', text.strip())
            sentences = [s.strip() for s in sentences if s.strip() and len(s.split()) > 3]
            
            if len(sentences) == 0:
                return {"success": False, "error": "Text too short to summarize"}
            
            if len(sentences) <= 2:
                # Text is already short, return as is
                return {
                    "success": True,
                    "original_text": text[:500] + "..." if len(text) > 500 else text,
                    "summary": text,
                    "original_word_count": len(text.split()),
                    "summary_word_count": len(text.split()),
                    "compression_ratio": 0,
                    "used_t5": False
                }
            
            # Score sentences based on multiple factors
            word_freq = Counter()
            for sentence in sentences:
                words = re.findall(r'\b[a-zA-Z]+\b', sentence.lower())
                word_freq.update(words)
            
            # Remove common stop words from frequency count
            stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                         'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                         'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
                         'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
                         'from', 'as', 'into', 'through', 'during', 'before', 'after',
                         'above', 'below', 'between', 'under', 'again', 'further', 'then',
                         'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
                         'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
                         'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
                         'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while',
                         'this', 'that', 'these', 'those', 'it', 'its', 'i', 'you', 'he',
                         'she', 'we', 'they', 'what', 'which', 'who', 'whom'}
            
            for word in stop_words:
                word_freq.pop(word, None)
            
            # Score each sentence
            sentence_scores = []
            for i, sentence in enumerate(sentences):
                words = re.findall(r'\b[a-zA-Z]+\b', sentence.lower())
                if not words:
                    sentence_scores.append(0)
                    continue
                
                # Word frequency score
                freq_score = sum(word_freq.get(w, 0) for w in words) / len(words)
                
                # Position score (first and last sentences are often important)
                position_score = 1.0
                if i == 0:
                    position_score = 1.5
                elif i == len(sentences) - 1:
                    position_score = 1.2
                elif i < len(sentences) * 0.3:
                    position_score = 1.1
                
                # Length score (prefer medium-length sentences)
                length_score = min(len(words) / 20, 1.0) if len(words) < 20 else max(0.5, 1 - (len(words) - 20) / 40)
                
                total_score = freq_score * position_score * length_score
                sentence_scores.append(total_score)
            
            # Select top sentences (aim for ~30-40% of original)
            num_sentences = max(1, min(len(sentences) - 1, int(len(sentences) * 0.4)))
            
            # Get indices of top scoring sentences
            top_indices = sorted(range(len(sentence_scores)), key=lambda i: sentence_scores[i], reverse=True)[:num_sentences]
            
            # Sort by original order to maintain coherence
            top_indices.sort()
            
            # Build summary
            summary = ' '.join(sentences[i] for i in top_indices)
            
            original_words = len(text.split())
            summary_words = len(summary.split())
            compression_ratio = round((1 - summary_words / original_words) * 100, 1) if original_words > 0 else 0
            
            return {
                "success": True,
                "original_text": text[:500] + "..." if len(text) > 500 else text,
                "summary": summary,
                "original_word_count": original_words,
                "summary_word_count": summary_words,
                "compression_ratio": compression_ratio,
                "used_t5": False
            }
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 6: Paraphraser ====================
    def paraphrase(self, text: str, mode: str = "standard") -> Dict[str, Any]:
        """Paraphrase text using T5 model with rule-based fallback."""
        try:
            import random
            used_t5 = False
            paraphrased = None
            
            # Try T5 model first
            mode_prompts = {
                "standard": f"Paraphrase the following text: {text}",
                "fluency": f"Rewrite the following text to improve fluency and flow: {text}",
                "creative": f"Creatively rewrite the following text with different wording: {text}",
                "formal": f"Rewrite the following text in a formal style: {text}",
                "simple": f"Simplify the following text using simple words: {text}",
            }
            
            t5_prompt = mode_prompts.get(mode.lower(), mode_prompts["standard"])
            t5_result = self._generate_with_t5(t5_prompt, max_length=len(text.split()) * 3, min_length=5)
            
            if t5_result and len(t5_result) > 10 and t5_result.lower() != text.lower():
                paraphrased = t5_result
                used_t5 = True
                logger.info(f"Paraphrasing using T5 model successful for mode: {mode}")
                
                return {
                    "success": True,
                    "original_text": text,
                    "paraphrased_text": paraphrased,
                    "mode": mode,
                    "original_word_count": len(text.split()),
                    "paraphrased_word_count": len(paraphrased.split()),
                    "used_t5": used_t5
                }
            
            # Fallback to rule-based paraphrasing
            logger.info(f"Falling back to rule-based paraphrasing for mode: {mode}")
            
            # Comprehensive synonym dictionary
            synonyms = {
                # Common verbs
                "use": ["utilize", "employ", "apply", "leverage"],
                "make": ["create", "produce", "generate", "construct"],
                "get": ["obtain", "acquire", "receive", "gain"],
                "give": ["provide", "offer", "supply", "deliver"],
                "show": ["demonstrate", "display", "reveal", "illustrate"],
                "help": ["assist", "aid", "support", "facilitate"],
                "find": ["discover", "locate", "identify", "uncover"],
                "think": ["believe", "consider", "suppose", "reckon"],
                "know": ["understand", "recognize", "realize", "comprehend"],
                "want": ["desire", "wish", "seek", "aspire"],
                "need": ["require", "necessitate", "demand"],
                "try": ["attempt", "endeavor", "strive"],
                "start": ["begin", "commence", "initiate", "launch"],
                "end": ["finish", "conclude", "complete", "terminate"],
                "change": ["modify", "alter", "transform", "adjust"],
                "move": ["relocate", "transfer", "shift", "transport"],
                "work": ["function", "operate", "perform", "labor"],
                "run": ["operate", "execute", "manage", "conduct"],
                "keep": ["maintain", "retain", "preserve", "sustain"],
                "let": ["allow", "permit", "enable"],
                "put": ["place", "position", "set", "locate"],
                "take": ["grab", "seize", "capture", "acquire"],
                "come": ["arrive", "approach", "reach"],
                "go": ["proceed", "advance", "travel", "move"],
                "see": ["observe", "notice", "view", "perceive"],
                "look": ["examine", "inspect", "observe", "view"],
                "say": ["state", "express", "declare", "mention"],
                "tell": ["inform", "notify", "advise", "communicate"],
                "ask": ["inquire", "question", "request"],
                
                # Common adjectives
                "good": ["excellent", "great", "fine", "superior"],
                "bad": ["poor", "inferior", "substandard", "inadequate"],
                "big": ["large", "substantial", "significant", "considerable"],
                "small": ["little", "minor", "modest", "compact"],
                "new": ["recent", "fresh", "modern", "novel"],
                "old": ["ancient", "aged", "former", "previous"],
                "important": ["significant", "crucial", "vital", "essential"],
                "different": ["distinct", "varied", "diverse", "unique"],
                "same": ["identical", "similar", "equivalent", "alike"],
                "easy": ["simple", "straightforward", "effortless"],
                "hard": ["difficult", "challenging", "tough", "demanding"],
                "fast": ["quick", "rapid", "swift", "speedy"],
                "slow": ["gradual", "unhurried", "leisurely"],
                "high": ["elevated", "tall", "lofty"],
                "low": ["reduced", "minimal", "diminished"],
                "long": ["extended", "lengthy", "prolonged"],
                "short": ["brief", "concise", "compact"],
                "many": ["numerous", "several", "multiple", "various"],
                "few": ["limited", "scarce", "sparse"],
                "great": ["excellent", "outstanding", "remarkable", "superb"],
                "little": ["small", "minor", "slight", "minimal"],
                
                # Common nouns
                "way": ["method", "approach", "manner", "technique"],
                "thing": ["item", "object", "element", "aspect"],
                "place": ["location", "site", "area", "spot"],
                "problem": ["issue", "challenge", "difficulty", "obstacle"],
                "part": ["portion", "section", "segment", "component"],
                "group": ["team", "collection", "set", "assembly"],
                "fact": ["truth", "reality", "detail", "point"],
                "idea": ["concept", "notion", "thought", "theory"],
                "point": ["aspect", "detail", "matter", "issue"],
                "reason": ["cause", "motive", "basis", "rationale"],
                "result": ["outcome", "consequence", "effect", "conclusion"],
                "answer": ["response", "reply", "solution"],
                "question": ["inquiry", "query", "issue"],
                
                # Common adverbs
                "very": ["extremely", "highly", "remarkably", "exceptionally"],
                "really": ["truly", "genuinely", "actually", "indeed"],
                "also": ["additionally", "furthermore", "moreover", "besides"],
                "just": ["simply", "merely", "only"],
                "now": ["currently", "presently", "at present"],
                "always": ["constantly", "continually", "perpetually"],
                "never": ["not ever", "at no time"],
                "often": ["frequently", "regularly", "commonly"],
                "sometimes": ["occasionally", "periodically", "at times"],
                "usually": ["typically", "generally", "normally", "commonly"],
                "quickly": ["rapidly", "swiftly", "promptly", "speedily"],
                "slowly": ["gradually", "steadily", "leisurely"],
            }
            
            # Simple words for "simple" mode
            simple_words = {
                "utilize": "use", "employ": "use", "leverage": "use",
                "obtain": "get", "acquire": "get", "procure": "get",
                "demonstrate": "show", "illustrate": "show", "exhibit": "show",
                "facilitate": "help", "assist": "help", "aid": "help",
                "commence": "start", "initiate": "start", "begin": "start",
                "terminate": "end", "conclude": "end", "finish": "end",
                "substantial": "big", "significant": "big", "considerable": "big",
                "minimal": "small", "minor": "small", "modest": "small",
                "numerous": "many", "multiple": "many", "various": "many",
                "extremely": "very", "highly": "very", "remarkably": "very",
                "approximately": "about", "roughly": "about",
                "subsequently": "then", "thereafter": "then",
                "nevertheless": "but", "however": "but", "nonetheless": "but",
                "therefore": "so", "consequently": "so", "thus": "so",
                "furthermore": "also", "moreover": "also", "additionally": "also",
            }
            
            # Formal words for "formal" mode
            formal_words = {
                "use": "utilize", "get": "obtain", "show": "demonstrate",
                "help": "facilitate", "start": "commence", "end": "conclude",
                "big": "substantial", "small": "minimal", "many": "numerous",
                "very": "extremely", "about": "approximately", "but": "however",
                "so": "therefore", "also": "furthermore", "think": "consider",
                "want": "desire", "need": "require", "try": "endeavor",
            }
            
            paraphrased = text
            mode_lower = mode.lower()
            
            if mode_lower == "simple":
                # Replace complex words with simple ones
                for complex_word, simple_word in simple_words.items():
                    paraphrased = re.sub(r'\b' + re.escape(complex_word) + r'\b', simple_word, paraphrased, flags=re.IGNORECASE)
            
            elif mode_lower == "formal":
                # Replace casual words with formal ones
                for casual_word, formal_word in formal_words.items():
                    paraphrased = re.sub(r'\b' + re.escape(casual_word) + r'\b', formal_word, paraphrased, flags=re.IGNORECASE)
            
            else:
                # Standard, fluency, or creative mode - use synonym replacement
                words = paraphrased.split()
                new_words = []
                
                for word in words:
                    # Clean word for lookup
                    clean_word = re.sub(r'[^\w]', '', word.lower())
                    
                    if clean_word in synonyms and random.random() < (0.5 if mode_lower == "creative" else 0.3):
                        # Get a random synonym
                        synonym = random.choice(synonyms[clean_word])
                        
                        # Preserve original capitalization
                        if word[0].isupper():
                            synonym = synonym.capitalize()
                        
                        # Preserve punctuation
                        if word[-1] in '.,!?;:':
                            synonym += word[-1]
                        
                        new_words.append(synonym)
                    else:
                        new_words.append(word)
                
                paraphrased = ' '.join(new_words)
            
            # For fluency mode, also improve sentence flow
            if mode_lower == "fluency":
                # Add transitional phrases between sentences
                sentences = re.split(r'(?<=[.!?])\s+', paraphrased)
                if len(sentences) > 1:
                    transitions = ["Additionally, ", "Furthermore, ", "Moreover, ", "In addition, ", "Also, "]
                    new_sentences = [sentences[0]]
                    for i, sent in enumerate(sentences[1:], 1):
                        if random.random() < 0.3 and not sent.startswith(tuple(transitions)):
                            sent = random.choice(transitions) + sent[0].lower() + sent[1:]
                        new_sentences.append(sent)
                    paraphrased = ' '.join(new_sentences)
            
            return {
                "success": True,
                "original_text": text,
                "paraphrased_text": paraphrased,
                "mode": mode,
                "original_word_count": len(text.split()),
                "paraphrased_word_count": len(paraphrased.split()),
                "used_t5": False
            }
        except Exception as e:
            logger.error(f"Paraphrasing failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 7: Citation Generator ====================
    async def generate_citation(
        self, 
        query: str = None,
        doi: str = None,
        url: str = None,
        style: str = "apa"
    ) -> Dict[str, Any]:
        """Generate citations using CrossRef API."""
        try:
            citation_data = None
            
            if doi:
                # Fetch from CrossRef by DOI
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(
                        f"https://api.crossref.org/works/{doi}",
                        headers={"User-Agent": "TextShift/1.0 (mailto:support@textshift.org)"}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        citation_data = data.get("message", {})
            
            elif query:
                # Search CrossRef
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(
                        "https://api.crossref.org/works",
                        params={"query": query, "rows": 5},
                        headers={"User-Agent": "TextShift/1.0 (mailto:support@textshift.org)"}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        items = data.get("message", {}).get("items", [])
                        if items:
                            citation_data = items[0]
            
            if not citation_data:
                return {"success": False, "error": "No citation data found"}
            
            # Extract citation components
            title = citation_data.get("title", ["Unknown Title"])[0] if citation_data.get("title") else "Unknown Title"
            authors = citation_data.get("author", [])
            author_names = []
            for author in authors[:5]:  # Limit to 5 authors
                given = author.get("given", "")
                family = author.get("family", "")
                author_names.append(f"{family}, {given[0]}." if given else family)
            
            year = citation_data.get("published-print", {}).get("date-parts", [[None]])[0][0]
            if not year:
                year = citation_data.get("published-online", {}).get("date-parts", [[None]])[0][0]
            year = year or "n.d."
            
            journal = citation_data.get("container-title", [""])[0] if citation_data.get("container-title") else ""
            volume = citation_data.get("volume", "")
            issue = citation_data.get("issue", "")
            pages = citation_data.get("page", "")
            doi_str = citation_data.get("DOI", "")
            
            # Format citation based on style
            if style.lower() == "apa":
                authors_str = ", ".join(author_names[:5])
                if len(authors) > 5:
                    authors_str += ", et al."
                citation = f"{authors_str} ({year}). {title}."
                if journal:
                    citation += f" {journal}"
                    if volume:
                        citation += f", {volume}"
                        if issue:
                            citation += f"({issue})"
                    if pages:
                        citation += f", {pages}"
                    citation += "."
                if doi_str:
                    citation += f" https://doi.org/{doi_str}"
            
            elif style.lower() == "mla":
                authors_str = ", ".join(author_names[:3])
                if len(authors) > 3:
                    authors_str += ", et al."
                citation = f'{authors_str}. "{title}."'
                if journal:
                    citation += f" {journal}"
                    if volume:
                        citation += f", vol. {volume}"
                        if issue:
                            citation += f", no. {issue}"
                    citation += f", {year}"
                    if pages:
                        citation += f", pp. {pages}"
                    citation += "."
            
            elif style.lower() == "chicago":
                authors_str = ", ".join(author_names)
                citation = f'{authors_str}. "{title}."'
                if journal:
                    citation += f" {journal}"
                    if volume:
                        citation += f" {volume}"
                        if issue:
                            citation += f", no. {issue}"
                    citation += f" ({year})"
                    if pages:
                        citation += f": {pages}"
                    citation += "."
            
            else:
                citation = f"{', '.join(author_names)} ({year}). {title}."
            
            return {
                "success": True,
                "citation": citation,
                "style": style,
                "title": title,
                "authors": author_names,
                "year": year,
                "journal": journal,
                "doi": doi_str,
                "raw_data": {
                    "volume": volume,
                    "issue": issue,
                    "pages": pages
                }
            }
        except Exception as e:
            logger.error(f"Citation generation failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 8: Word Counter ====================
    def count_words_detailed(self, text: str) -> Dict[str, Any]:
        """Detailed word and character count analysis."""
        try:
            # Basic counts
            words = text.split()
            word_count = len(words)
            char_count_with_spaces = len(text)
            char_count_no_spaces = len(text.replace(" ", "").replace("\n", "").replace("\t", ""))
            
            # Sentence and paragraph counts
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            sentence_count = len(sentences)
            
            paragraphs = text.split('\n\n')
            paragraphs = [p.strip() for p in paragraphs if p.strip()]
            paragraph_count = len(paragraphs) if paragraphs else 1
            
            # Reading time estimates
            reading_time_minutes = word_count / 200  # Average reading speed
            speaking_time_minutes = word_count / 150  # Average speaking speed
            
            # Unique words
            unique_words = len(set(w.lower() for w in words))
            
            # Most common words (excluding common stop words)
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they'}
            filtered_words = [w.lower() for w in words if w.lower() not in stop_words and len(w) > 2]
            word_freq = Counter(filtered_words)
            top_words = word_freq.most_common(10)
            
            return {
                "success": True,
                "word_count": word_count,
                "character_count": char_count_with_spaces,
                "character_count_no_spaces": char_count_no_spaces,
                "sentence_count": sentence_count,
                "paragraph_count": paragraph_count,
                "unique_words": unique_words,
                "avg_word_length": round(char_count_no_spaces / word_count, 1) if word_count > 0 else 0,
                "avg_sentence_length": round(word_count / sentence_count, 1) if sentence_count > 0 else 0,
                "reading_time_minutes": round(reading_time_minutes, 1),
                "speaking_time_minutes": round(speaking_time_minutes, 1),
                "top_words": [{"word": w, "count": c} for w, c in top_words]
            }
        except Exception as e:
            logger.error(f"Word count failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 9: Translator ====================
    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Translate text using Helsinki-NLP models."""
        try:
            lang_pair = f"{source_lang}-{target_lang}"
            
            if lang_pair not in self.SUPPORTED_LANGUAGES:
                return {
                    "success": False,
                    "error": f"Language pair {lang_pair} not supported. Supported: {list(self.SUPPORTED_LANGUAGES.keys())}"
                }
            
            self._load_translator_model(lang_pair)
            
            if lang_pair not in self._translator_models:
                return {"success": False, "error": f"Failed to load translator for {lang_pair}"}
            
            tokenizer, model = self._translator_models[lang_pair]
            
            # Split into sentences for better translation
            sentences = re.split(r'(?<=[.!?])\s+', text)
            translated_sentences = []
            
            for sentence in sentences:
                if not sentence.strip():
                    continue
                    
                inputs = tokenizer(sentence, return_tensors="pt", truncation=True, max_length=512)
                
                with torch.no_grad():
                    outputs = model.generate(**inputs, max_length=512, num_beams=4)
                
                translated = tokenizer.decode(outputs[0], skip_special_tokens=True)
                translated_sentences.append(translated)
            
            translated_text = " ".join(translated_sentences)
            
            return {
                "success": True,
                "original_text": text,
                "translated_text": translated_text,
                "source_language": source_lang,
                "target_language": target_lang,
                "language_pair": self.SUPPORTED_LANGUAGES[lang_pair],
                "word_count_original": len(text.split()),
                "word_count_translated": len(translated_text.split())
            }
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 10: Export Options ====================
    def export_text(self, text: str, format: str, title: str = "Document") -> Dict[str, Any]:
        """Export text to different formats (TXT, HTML, Markdown)."""
        try:
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            if format.lower() == "txt":
                content = f"{title}\n{'=' * len(title)}\n\n{text}\n\n---\nExported from TextShift on {timestamp}"
                mime_type = "text/plain"
                extension = "txt"
            
            elif format.lower() == "html":
                paragraphs = text.split('\n\n')
                html_paragraphs = ''.join(f'<p>{p}</p>' for p in paragraphs if p.strip())
                content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }}
        h1 {{ color: #333; }}
        p {{ margin-bottom: 1em; }}
        footer {{ margin-top: 40px; color: #666; font-size: 0.9em; border-top: 1px solid #ddd; padding-top: 20px; }}
    </style>
</head>
<body>
    <h1>{title}</h1>
    {html_paragraphs}
    <footer>Exported from TextShift on {timestamp}</footer>
</body>
</html>"""
                mime_type = "text/html"
                extension = "html"
            
            elif format.lower() == "markdown" or format.lower() == "md":
                content = f"# {title}\n\n{text}\n\n---\n*Exported from TextShift on {timestamp}*"
                mime_type = "text/markdown"
                extension = "md"
            
            else:
                return {"success": False, "error": f"Unsupported format: {format}"}
            
            return {
                "success": True,
                "content": content,
                "format": format.lower(),
                "mime_type": mime_type,
                "extension": extension,
                "filename": f"{title.replace(' ', '_').lower()}.{extension}",
                "size_bytes": len(content.encode('utf-8'))
            }
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 13: Style Analysis ====================
    def analyze_style(self, text: str) -> Dict[str, Any]:
        """Analyze writing style including vocabulary, sentence structure, etc."""
        try:
            words = text.split()
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            word_count = len(words)
            sentence_count = len(sentences) if sentences else 1
            
            # Vocabulary diversity (Type-Token Ratio)
            unique_words = set(w.lower() for w in words)
            ttr = len(unique_words) / word_count if word_count > 0 else 0
            
            # Sentence length variation
            sentence_lengths = [len(s.split()) for s in sentences]
            avg_sentence_length = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
            sentence_length_std = (sum((l - avg_sentence_length) ** 2 for l in sentence_lengths) / len(sentence_lengths)) ** 0.5 if sentence_lengths else 0
            
            # Passive voice detection (simplified)
            passive_indicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am']
            passive_count = sum(1 for s in sentences if any(f" {p} " in f" {s.lower()} " for p in passive_indicators) and 'by' in s.lower())
            passive_percentage = (passive_count / sentence_count * 100) if sentence_count > 0 else 0
            
            # Question and exclamation counts
            question_count = text.count('?')
            exclamation_count = text.count('!')
            
            # Transition words
            transition_words = ['however', 'therefore', 'moreover', 'furthermore', 'consequently', 'nevertheless', 'meanwhile', 'additionally', 'similarly', 'likewise', 'in contrast', 'on the other hand', 'as a result', 'for example', 'in conclusion']
            transition_count = sum(1 for tw in transition_words if tw in text.lower())
            
            # Determine writing style
            if ttr > 0.7 and avg_sentence_length > 20:
                style_type = "Academic/Formal"
            elif ttr < 0.4 and avg_sentence_length < 12:
                style_type = "Simple/Conversational"
            elif question_count > sentence_count * 0.2:
                style_type = "Interrogative/Engaging"
            elif exclamation_count > sentence_count * 0.1:
                style_type = "Expressive/Emotional"
            else:
                style_type = "Standard/Neutral"
            
            return {
                "success": True,
                "style_type": style_type,
                "vocabulary_diversity": round(ttr * 100, 1),
                "vocabulary_level": "Rich" if ttr > 0.6 else "Moderate" if ttr > 0.4 else "Simple",
                "avg_sentence_length": round(avg_sentence_length, 1),
                "sentence_length_variation": round(sentence_length_std, 1),
                "passive_voice_percentage": round(passive_percentage, 1),
                "transition_word_count": transition_count,
                "question_count": question_count,
                "exclamation_count": exclamation_count,
                "unique_word_count": len(unique_words),
                "total_word_count": word_count,
                "recommendations": self._get_style_recommendations(ttr, avg_sentence_length, passive_percentage, transition_count)
            }
        except Exception as e:
            logger.error(f"Style analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_style_recommendations(self, ttr: float, avg_sent_len: float, passive_pct: float, transitions: int) -> List[str]:
        """Generate writing style recommendations."""
        recommendations = []
        
        if ttr < 0.4:
            recommendations.append("Consider using more varied vocabulary to make your writing more engaging.")
        if avg_sent_len > 25:
            recommendations.append("Some sentences are quite long. Consider breaking them up for better readability.")
        if avg_sent_len < 10:
            recommendations.append("Your sentences are quite short. Consider combining some for better flow.")
        if passive_pct > 30:
            recommendations.append("High use of passive voice detected. Consider using more active voice for stronger writing.")
        if transitions < 2:
            recommendations.append("Adding transition words can improve the flow between ideas.")
        
        if not recommendations:
            recommendations.append("Your writing style is well-balanced!")
        
        return recommendations
    
    # ==================== Feature 14: Content Improver ====================
    def improve_content(self, text: str, focus: str = "clarity") -> Dict[str, Any]:
        """Improve content using T5 model with rule-based fallback."""
        try:
            import random
            used_t5 = False
            improved_text = None
            suggestions = []
            
            # Try T5 model first
            focus_prompts = {
                "clarity": f"Rewrite the following text to improve clarity and make it easier to understand: {text}",
                "conciseness": f"Rewrite the following text to be more concise and remove unnecessary words: {text}",
                "engagement": f"Rewrite the following text to be more engaging and interesting: {text}",
                "professionalism": f"Rewrite the following text in a professional tone: {text}",
                "seo": f"Rewrite the following text to be more SEO-friendly with shorter sentences: {text}",
            }
            
            t5_prompt = focus_prompts.get(focus.lower(), focus_prompts["clarity"])
            t5_result = self._generate_with_t5(t5_prompt, max_length=len(text.split()) * 3, min_length=5)
            
            if t5_result and len(t5_result) > 10 and t5_result.lower() != text.lower():
                improved_text = t5_result
                used_t5 = True
                suggestions.append(f"Content improved using AI model for {focus}")
                logger.info(f"Content improvement using T5 model successful for focus: {focus}")
                
                # Calculate improvement metrics
                original_readability = self.analyze_readability(text)
                improved_readability = self.analyze_readability(improved_text)
                
                return {
                    "success": True,
                    "original_text": text,
                    "improved_text": improved_text,
                    "focus": focus,
                    "suggestions": suggestions,
                    "original_word_count": len(text.split()),
                    "improved_word_count": len(improved_text.split()),
                    "readability_change": {
                        "original_score": original_readability.get("flesch_reading_ease", 0),
                        "improved_score": improved_readability.get("flesch_reading_ease", 0)
                    },
                    "used_t5": used_t5
                }
            
            # Fallback to rule-based content improvement
            logger.info(f"Falling back to rule-based content improvement for focus: {focus}")
            improved_text = text
            
            focus_lower = focus.lower()
            
            if focus_lower == "clarity":
                # Clarity improvements: simplify complex sentences, remove ambiguity
                clarity_replacements = {
                    "utilize": "use", "implement": "use", "leverage": "use",
                    "facilitate": "help", "endeavor": "try", "commence": "start",
                    "terminate": "end", "subsequently": "then", "prior to": "before",
                    "in order to": "to", "due to the fact that": "because",
                    "at this point in time": "now", "in the event that": "if",
                    "for the purpose of": "to", "with regard to": "about",
                    "in spite of the fact that": "although", "on account of": "because",
                    "in close proximity to": "near", "a large number of": "many",
                    "the majority of": "most", "at the present time": "now",
                    "in the near future": "soon", "has the ability to": "can",
                    "is able to": "can", "in addition to": "besides",
                }
                for old, new in clarity_replacements.items():
                    if old in improved_text.lower():
                        improved_text = re.sub(re.escape(old), new, improved_text, flags=re.IGNORECASE)
                        suggestions.append(f"Simplified '{old}' to '{new}' for clarity")
                
            elif focus_lower == "conciseness":
                # Remove filler words and redundant phrases
                filler_patterns = [
                    (r'\bvery\s+', ''), (r'\breally\s+', ''), (r'\bjust\s+', ''),
                    (r'\bbasically\s+', ''), (r'\bactually\s+', ''), (r'\bliterally\s+', ''),
                    (r'\bsimply\s+', ''), (r'\bdefinitely\s+', ''), (r'\bcertainly\s+', ''),
                    (r'\bin my opinion,?\s*', ''), (r'\bI think that\s+', ''),
                    (r'\bIt is important to note that\s+', ''),
                    (r'\bIt should be noted that\s+', ''),
                    (r'\bAs a matter of fact,?\s*', ''),
                    (r'\bAt the end of the day,?\s*', ''),
                    (r'\bAll things considered,?\s*', ''),
                ]
                for pattern, replacement in filler_patterns:
                    if re.search(pattern, improved_text, re.IGNORECASE):
                        improved_text = re.sub(pattern, replacement, improved_text, flags=re.IGNORECASE)
                        suggestions.append(f"Removed filler phrase for conciseness")
                
            elif focus_lower == "engagement":
                # Add engaging elements
                sentences = re.split(r'(?<=[.!?])\s+', improved_text)
                if sentences:
                    # Add a hook at the beginning if not already engaging
                    hooks = ["Here's the thing: ", "Consider this: ", "What if ", "Imagine "]
                    if not any(improved_text.startswith(h) for h in hooks):
                        improved_text = random.choice(hooks) + improved_text[0].lower() + improved_text[1:]
                        suggestions.append("Added engaging hook at the beginning")
                    
                    # Convert some statements to questions for engagement
                    if len(sentences) > 2 and '?' not in improved_text:
                        improved_text += " What do you think?"
                        suggestions.append("Added question to encourage engagement")
                
            elif focus_lower == "professionalism":
                # Professional tone improvements
                professional_replacements = {
                    "can't": "cannot", "won't": "will not", "don't": "do not",
                    "gonna": "going to", "wanna": "want to", "gotta": "have to",
                    "yeah": "yes", "nope": "no", "ok": "acceptable",
                    "awesome": "excellent", "cool": "satisfactory", "stuff": "materials",
                    "things": "items", "guy": "individual", "guys": "individuals",
                    "kids": "children", "a lot": "significantly", "pretty": "quite",
                    "super": "extremely", "totally": "completely",
                }
                for old, new in professional_replacements.items():
                    if old in improved_text.lower():
                        improved_text = re.sub(r'\b' + re.escape(old) + r'\b', new, improved_text, flags=re.IGNORECASE)
                        suggestions.append(f"Changed '{old}' to '{new}' for professionalism")
                
            elif focus_lower == "seo":
                # SEO improvements: shorter sentences, active voice hints
                sentences = re.split(r'(?<=[.!?])\s+', improved_text)
                new_sentences = []
                for sent in sentences:
                    words = sent.split()
                    if len(words) > 25:
                        # Try to split long sentences
                        mid = len(words) // 2
                        # Find a good split point (after a comma or conjunction)
                        for i in range(mid - 5, mid + 5):
                            if i < len(words) and words[i].rstrip(',') in ['and', 'but', 'or', 'so', 'yet']:
                                first_part = ' '.join(words[:i])
                                second_part = ' '.join(words[i+1:])
                                if not first_part.endswith('.'):
                                    first_part += '.'
                                second_part = second_part[0].upper() + second_part[1:] if second_part else ''
                                new_sentences.append(first_part)
                                new_sentences.append(second_part)
                                suggestions.append("Split long sentence for better readability")
                                break
                        else:
                            new_sentences.append(sent)
                    else:
                        new_sentences.append(sent)
                improved_text = ' '.join(new_sentences)
            
            # Calculate improvement metrics
            original_readability = self.analyze_readability(text)
            improved_readability = self.analyze_readability(improved_text)
            
            return {
                "success": True,
                "original_text": text,
                "improved_text": improved_text,
                "focus": focus,
                "suggestions": suggestions[:5] if suggestions else ["Text analyzed - minor improvements applied"],
                "original_word_count": len(text.split()),
                "improved_word_count": len(improved_text.split()),
                "readability_change": {
                    "original_score": original_readability.get("flesch_reading_ease", 0),
                    "improved_score": improved_readability.get("flesch_reading_ease", 0)
                },
                "used_t5": False
            }
        except Exception as e:
            logger.error(f"Content improvement failed: {e}")
            return {"success": False, "error": str(e)}


# Singleton instance
writing_tools_service = WritingToolsService()
