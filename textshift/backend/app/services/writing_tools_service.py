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
    
    # ==================== Feature 1: Grammar Checker ====================
    async def check_grammar(self, text: str) -> Dict[str, Any]:
        """Check grammar using LanguageTool API (free, 20 requests/min)."""
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
                    
                    errors = []
                    corrected_text = text
                    offset_adjustment = 0
                    
                    for match in matches:
                        error = {
                            "message": match.get("message", ""),
                            "short_message": match.get("shortMessage", ""),
                            "offset": match.get("offset", 0),
                            "length": match.get("length", 0),
                            "context": match.get("context", {}).get("text", ""),
                            "rule_id": match.get("rule", {}).get("id", ""),
                            "rule_category": match.get("rule", {}).get("category", {}).get("name", ""),
                            "replacements": [r.get("value", "") for r in match.get("replacements", [])[:3]]
                        }
                        errors.append(error)
                        
                        # Apply first replacement to corrected text
                        if error["replacements"]:
                            start = error["offset"] + offset_adjustment
                            end = start + error["length"]
                            replacement = error["replacements"][0]
                            corrected_text = corrected_text[:start] + replacement + corrected_text[end:]
                            offset_adjustment += len(replacement) - error["length"]
                    
                    return {
                        "success": True,
                        "original_text": text,
                        "corrected_text": corrected_text,
                        "error_count": len(errors),
                        "errors": errors,
                        "language": "en-US"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"LanguageTool API error: {response.status_code}"
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
        """Adjust text tone using T5 model."""
        try:
            self._load_t5_model()
            
            if self._t5_model is None:
                return {"success": False, "error": "T5 model not available"}
            
            # Tone adjustment prompts
            tone_prompts = {
                "formal": "Rewrite this text in a formal, professional tone: ",
                "casual": "Rewrite this text in a casual, friendly tone: ",
                "persuasive": "Rewrite this text in a persuasive, compelling tone: ",
                "academic": "Rewrite this text in an academic, scholarly tone: ",
                "confident": "Rewrite this text in a confident, assertive tone: ",
                "empathetic": "Rewrite this text in an empathetic, understanding tone: ",
            }
            
            prompt = tone_prompts.get(target_tone.lower(), f"Rewrite this text in a {target_tone} tone: ")
            input_text = prompt + text
            
            inputs = self._t5_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._t5_model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=4,
                    early_stopping=True,
                    no_repeat_ngram_size=2
                )
            
            adjusted_text = self._t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return {
                "success": True,
                "original_text": text,
                "adjusted_text": adjusted_text,
                "target_tone": target_tone,
                "word_count_original": len(text.split()),
                "word_count_adjusted": len(adjusted_text.split())
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
        """Summarize text using T5 model."""
        try:
            self._load_t5_model()
            
            if self._t5_model is None:
                return {"success": False, "error": "T5 model not available"}
            
            input_text = "summarize: " + text
            
            inputs = self._t5_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=1024
            )
            
            with torch.no_grad():
                outputs = self._t5_model.generate(
                    **inputs,
                    max_length=max_length,
                    min_length=min_length,
                    num_beams=4,
                    early_stopping=True,
                    no_repeat_ngram_size=2
                )
            
            summary = self._t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            original_words = len(text.split())
            summary_words = len(summary.split())
            compression_ratio = round((1 - summary_words / original_words) * 100, 1) if original_words > 0 else 0
            
            return {
                "success": True,
                "original_text": text[:500] + "..." if len(text) > 500 else text,
                "summary": summary,
                "original_word_count": original_words,
                "summary_word_count": summary_words,
                "compression_ratio": compression_ratio
            }
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== Feature 6: Paraphraser ====================
    def paraphrase(self, text: str, mode: str = "standard") -> Dict[str, Any]:
        """Paraphrase text using T5 model with different modes."""
        try:
            self._load_t5_model()
            
            if self._t5_model is None:
                return {"success": False, "error": "T5 model not available"}
            
            # Different paraphrasing prompts
            mode_prompts = {
                "standard": "paraphrase: ",
                "fluency": "paraphrase for better fluency: ",
                "creative": "creatively rewrite: ",
                "formal": "paraphrase in formal language: ",
                "simple": "paraphrase in simple words: "
            }
            
            prompt = mode_prompts.get(mode.lower(), "paraphrase: ")
            input_text = prompt + text
            
            inputs = self._t5_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._t5_model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=5,
                    num_return_sequences=1,
                    early_stopping=True,
                    no_repeat_ngram_size=2,
                    temperature=0.8 if mode == "creative" else 1.0
                )
            
            paraphrased = self._t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return {
                "success": True,
                "original_text": text,
                "paraphrased_text": paraphrased,
                "mode": mode,
                "original_word_count": len(text.split()),
                "paraphrased_word_count": len(paraphrased.split())
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
        """Improve content using T5 model with different focus areas."""
        try:
            self._load_t5_model()
            
            if self._t5_model is None:
                return {"success": False, "error": "T5 model not available"}
            
            # Different improvement prompts
            focus_prompts = {
                "clarity": "Rewrite for better clarity and understanding: ",
                "conciseness": "Make this more concise while keeping the meaning: ",
                "engagement": "Rewrite to be more engaging and interesting: ",
                "professionalism": "Rewrite in a more professional manner: ",
                "seo": "Optimize this content for better readability and SEO: "
            }
            
            prompt = focus_prompts.get(focus.lower(), "Improve this text: ")
            input_text = prompt + text
            
            inputs = self._t5_tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._t5_model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=4,
                    early_stopping=True,
                    no_repeat_ngram_size=2
                )
            
            improved_text = self._t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Calculate improvement metrics
            original_readability = self.analyze_readability(text)
            improved_readability = self.analyze_readability(improved_text)
            
            return {
                "success": True,
                "original_text": text,
                "improved_text": improved_text,
                "focus": focus,
                "original_word_count": len(text.split()),
                "improved_word_count": len(improved_text.split()),
                "readability_change": {
                    "original_score": original_readability.get("flesch_reading_ease", 0),
                    "improved_score": improved_readability.get("flesch_reading_ease", 0)
                }
            }
        except Exception as e:
            logger.error(f"Content improvement failed: {e}")
            return {"success": False, "error": str(e)}


# Singleton instance
writing_tools_service = WritingToolsService()
