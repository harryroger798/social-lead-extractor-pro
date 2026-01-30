import os
import gc
import re
import torch
import torch.nn as nn
import logging
import random
from typing import Optional, Dict, Any, List
from transformers import AutoTokenizer, AutoModelForSequenceClassification, T5Tokenizer, T5ForConditionalGeneration
from sentence_transformers import SentenceTransformer
import numpy as np
from collections import Counter
from app.core.config import settings

logger = logging.getLogger(__name__)


# StealthWriter Post-Processor Constants
CONTRACTION_EXPANSIONS = {
    "it's": "it is", "don't": "do not", "can't": "cannot", "won't": "will not",
    "wouldn't": "would not", "couldn't": "could not", "shouldn't": "should not",
    "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not",
    "hasn't": "has not", "haven't": "have not", "hadn't": "had not",
    "doesn't": "does not", "didn't": "did not", "I'm": "I am", "I've": "I have",
    "I'll": "I will", "I'd": "I would", "you're": "you are", "you've": "you have",
    "you'll": "you will", "you'd": "you would", "he's": "he is", "she's": "she is",
    "we're": "we are", "we've": "we have", "we'll": "we will",
    "they're": "they are", "they've": "they have", "they'll": "they will",
    "that's": "that is", "there's": "there is", "here's": "here is",
    "what's": "what is", "who's": "who is", "let's": "let us",
}

FORMAL_STARTERS = [
    "It is almost a given that ", "One must acknowledge that ",
    "In point of fact, ", "As a matter of fact, ",
    "It bears mentioning that ", "It is worth noting that ",
    "From a practical standpoint, ", "Upon closer examination, ",
]

SYNONYM_REPLACEMENTS = {
    "help": "assist", "use": "utilize", "get": "obtain", "think": "believe",
    "very": "quite", "big": "substantial", "small": "modest", "good": "favorable",
    "bad": "unfavorable", "important": "significant", "show": "demonstrate",
    "make": "create", "need": "require", "want": "desire", "start": "commence",
    "end": "conclude", "give": "provide", "take": "acquire", "find": "discover",
    "tell": "inform", "ask": "inquire", "try": "attempt", "keep": "maintain",
    "let": "permit", "seem": "appear", "feel": "sense", "become": "evolve into",
    "leave": "depart", "put": "place", "mean": "signify", "old": "aged",
    "new": "recent", "last": "final", "long": "extended", "great": "remarkable",
    "little": "minimal", "own": "possess", "other": "alternative", "right": "correct",
    "high": "elevated", "different": "distinct", "whole": "entire",
    "large": "considerable", "next": "subsequent", "early": "initial",
    "young": "youthful", "hard": "difficult", "major": "principal",
    "better": "superior", "best": "optimal",
}

FILLERS_TO_REMOVE = [
    "like, ", "you know, ", "basically, ", "honestly, ", "I mean, ",
    "just ", "really ", "actually ", "literally ", "obviously ",
    "clearly ", "simply ", "definitely ", "certainly ", "absolutely ",
    "totally ", "completely ", "pretty much ", "kind of ", "sort of ",
]


class PlagiarismClassifier(nn.Module):
    """Neural network classifier for plagiarism detection."""
    
    def __init__(self, embedding_dim: int = 384):
        super().__init__()
        input_dim = embedding_dim * 4
        self.classifier = nn.Sequential(
            nn.Linear(input_dim, 512), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(512, 256), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 1), nn.Sigmoid()
        )
    
    def forward(self, emb1: torch.Tensor, emb2: torch.Tensor) -> torch.Tensor:
        diff = emb1 - emb2
        product = emb1 * emb2
        combined = torch.cat([emb1, emb2, diff, product], dim=1)
        return self.classifier(combined)


class MLModelService:
    """Singleton service for ML models with lazy loading. Uses trained models from iDrive e2."""
    
    _instance = None
    _current_model: Optional[str] = None
    _detector_model = None
    _detector_tokenizer = None
    _humanizer_model = None
    _humanizer_tokenizer = None
    _plagiarism_encoder = None
    _plagiarism_classifier = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _unload_all_models(self):
        logger.info("Unloading all models...")
        self._detector_model = None
        self._detector_tokenizer = None
        self._humanizer_model = None
        self._humanizer_tokenizer = None
        self._plagiarism_encoder = None
        self._plagiarism_classifier = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        self._current_model = None
        logger.info("All models unloaded")
    
    def _load_detector(self):
        if self._current_model != "detector":
            self._unload_all_models()
            logger.info("Loading AI detector model (RoBERTa)...")
            model_path = settings.DETECTOR_MODEL_PATH
            if os.path.exists(os.path.join(model_path, "model.safetensors")):
                self._detector_tokenizer = AutoTokenizer.from_pretrained(model_path)
                self._detector_model = AutoModelForSequenceClassification.from_pretrained(model_path, torch_dtype=torch.float32)
                self._detector_model.eval()
                logger.info(f"Loaded trained RoBERTa model from {model_path}")
            else:
                logger.warning(f"Local model not found at {model_path}, using fallback")
                self._detector_tokenizer = AutoTokenizer.from_pretrained("roberta-base")
                self._detector_model = AutoModelForSequenceClassification.from_pretrained("roberta-base", num_labels=2)
            self._current_model = "detector"
    
    def _load_humanizer(self):
        if self._current_model != "humanizer":
            self._unload_all_models()
            logger.info("Loading humanizer model (T5 V3)...")
            model_path = settings.HUMANIZER_MODEL_PATH
            if os.path.exists(os.path.join(model_path, "model.safetensors")):
                self._humanizer_tokenizer = T5Tokenizer.from_pretrained(model_path)
                self._humanizer_model = T5ForConditionalGeneration.from_pretrained(model_path, torch_dtype=torch.float32)
                self._humanizer_model.eval()
                logger.info(f"Loaded trained T5 V3 model from {model_path}")
            else:
                logger.warning(f"Local model not found at {model_path}, using base T5")
                self._humanizer_tokenizer = T5Tokenizer.from_pretrained("t5-base")
                self._humanizer_model = T5ForConditionalGeneration.from_pretrained("t5-base")
            self._current_model = "humanizer"
    
    def _load_plagiarism(self):
        if self._current_model != "plagiarism":
            self._unload_all_models()
            logger.info("Loading plagiarism model...")
            model_path = settings.PLAGIARISM_MODEL_PATH
            self._plagiarism_encoder = SentenceTransformer('all-MiniLM-L6-v2')
            classifier_path = os.path.join(model_path, "plagiarism_classifier.pt")
            if os.path.exists(classifier_path):
                self._plagiarism_classifier = PlagiarismClassifier(embedding_dim=384)
                state_dict = torch.load(classifier_path, map_location='cpu')
                self._plagiarism_classifier.load_state_dict(state_dict)
                self._plagiarism_classifier.eval()
                logger.info(f"Loaded trained plagiarism classifier")
            else:
                self._plagiarism_classifier = None
            self._current_model = "plagiarism"
    
    def _split_sentences(self, text: str) -> List[str]:
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _calculate_confidence_score(self, ai_prob: float) -> int:
        if ai_prob >= 0.95:
            return 10
        elif ai_prob >= 0.85:
            return 9
        elif ai_prob >= 0.75:
            return 8
        elif ai_prob >= 0.65:
            return 7
        elif ai_prob >= 0.55:
            return 6
        elif ai_prob >= 0.45:
            return 5
        elif ai_prob >= 0.35:
            return 4
        elif ai_prob >= 0.25:
            return 3
        elif ai_prob >= 0.15:
            return 2
        else:
            return 1
    
    def _get_confidence_level(self, score: int) -> str:
        if score >= 9:
            return "very_high"
        elif score >= 7:
            return "high"
        elif score >= 5:
            return "medium"
        elif score >= 3:
            return "low"
        else:
            return "very_low"
    
    def _avg_sentence_length(self, text: str) -> float:
        sentences = self._split_sentences(text)
        if not sentences:
            return 0
        return sum(len(s.split()) for s in sentences) / len(sentences)
    
    def _analyze_sentences(self, text: str) -> List[Dict[str, Any]]:
        sentences = [s for s in self._split_sentences(text) if len(s) > 10]
        results = []
        for sentence in sentences[:10]:
            inputs = self._detector_tokenizer(sentence, return_tensors="pt", truncation=True, max_length=512, padding=True)
            with torch.no_grad():
                outputs = self._detector_model(**inputs)
                probs = torch.softmax(outputs.logits, dim=-1)
            results.append({
                "text": sentence[:100] + "..." if len(sentence) > 100 else sentence,
                "ai_probability": round(probs[0][1].item() * 100, 2)
            })
        return results
    
    def _perform_10_level_analysis(self, text: str, ai_prob: float) -> Dict[str, Any]:
        words = text.split()
        sentences = self._split_sentences(text)
        word_freq = Counter(w.lower() for w in words)
        
        formal_markers = sum(1 for w in words if w.lower() in ['therefore', 'however', 'furthermore', 'moreover', 'consequently', 'nevertheless'])
        casual_markers = sum(1 for w in words if w.lower() in ['like', 'just', 'really', 'actually', 'basically', 'literally'])
        statistical_score = min(1.0, formal_markers / max(1, len(words) / 50)) if formal_markers > casual_markers else 0.3
        
        passive_count = len(re.findall(r'\b(is|are|was|were|been|being)\s+\w+ed\b', text, re.IGNORECASE))
        syntactic_score = min(1.0, (passive_count / max(1, len(sentences))) * 2)
        
        unique_ratio = len(word_freq) / max(1, len(words))
        entropy_score = 1.0 - unique_ratio
        
        ttr = len(set(w.lower() for w in words)) / max(1, len(words))
        hapax = sum(1 for w, c in word_freq.items() if c == 1)
        hapax_ratio = hapax / max(1, len(word_freq))
        lexical_score = 1.0 - (ttr * 0.5 + hapax_ratio * 0.5)
        
        entities = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        entity_score = 1.0 - min(1.0, len(entities) / max(1, len(words) / 10))
        
        temporal_words = ['yesterday', 'today', 'tomorrow', 'last week', 'next month', 'recently', 'currently']
        temporal_count = sum(1 for t in temporal_words if t.lower() in text.lower())
        temporal_score = 1.0 - min(1.0, temporal_count / 3)
        
        weights = {"statistical": 0.20, "syntactic": 0.15, "entropy": 0.20, "lexical": 0.15, "entities": 0.15, "temporal": 0.15}
        combined_score = sum([
            statistical_score * weights["statistical"],
            syntactic_score * weights["syntactic"],
            entropy_score * weights["entropy"],
            lexical_score * weights["lexical"],
            entity_score * weights["entities"],
            temporal_score * weights["temporal"]
        ])
        
        return {
            "statistical_fingerprinting": {
                "score": round(statistical_score * 100, 2),
                "formal_markers": formal_markers,
                "casual_markers": casual_markers,
                "description": "Formal language patterns vs casual markers"
            },
            "syntactic_patterns": {
                "score": round(syntactic_score * 100, 2),
                "passive_voice_count": passive_count,
                "description": "Sentence structure and passive voice usage"
            },
            "ngram_entropy": {
                "score": round(entropy_score * 100, 2),
                "unique_word_ratio": round(unique_ratio, 3),
                "description": "Vocabulary repetition patterns"
            },
            "lexical_diversity": {
                "score": round(lexical_score * 100, 2),
                "type_token_ratio": round(ttr, 3),
                "hapax_ratio": round(hapax_ratio, 3),
                "description": "Type-token ratio and hapax legomena"
            },
            "named_entities": {
                "score": round(entity_score * 100, 2),
                "entity_count": len(entities),
                "description": "Specific names, dates, numbers"
            },
            "temporal_contextual": {
                "score": round(temporal_score * 100, 2),
                "temporal_references": temporal_count,
                "description": "Generic vs specific time references"
            },
            "combined_score": round(combined_score * 100, 2),
            "weights": weights
        }
    
    def detect_ai(self, text: str) -> Dict[str, Any]:
        self._load_detector()
        inputs = self._detector_tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
        with torch.no_grad():
            outputs = self._detector_model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=-1)
        human_prob = probabilities[0][0].item()
        ai_prob = probabilities[0][1].item()
        confidence_score = self._calculate_confidence_score(ai_prob)
        return {
            "ai_probability": round(ai_prob * 100, 2),
            "human_probability": round(human_prob * 100, 2),
            "confidence_score": confidence_score,
            "confidence_level": self._get_confidence_level(confidence_score),
            "analysis": {
                "text_length": len(text),
                "word_count": len(text.split()),
                "avg_sentence_length": self._avg_sentence_length(text)
            },
            "sentence_analysis": self._analyze_sentences(text),
            "level_analysis": self._perform_10_level_analysis(text, ai_prob)
        }
    
    def _apply_stealthwriter_postprocessor(self, text: str, passes: int = 2) -> str:
        result = text
        for _ in range(passes):
            for contraction, expansion in CONTRACTION_EXPANSIONS.items():
                result = re.sub(re.escape(contraction), expansion, result, flags=re.IGNORECASE)
            for filler in FILLERS_TO_REMOVE:
                result = result.replace(filler, "").replace(filler.capitalize(), "")
            words = result.split()
            new_words = []
            for word in words:
                lower_word = word.lower()
                if lower_word in SYNONYM_REPLACEMENTS:
                    replacement = SYNONYM_REPLACEMENTS[lower_word]
                    if word[0].isupper():
                        replacement = replacement.capitalize()
                    new_words.append(replacement)
                else:
                    new_words.append(word)
            result = " ".join(new_words)
            sentences = self._split_sentences(result)
            new_sentences = []
            for i, sentence in enumerate(sentences):
                if i == 0 and len(sentence) > 20 and random.random() < 0.3:
                    starter = random.choice(FORMAL_STARTERS)
                    sentence = starter + sentence[0].lower() + sentence[1:]
                new_sentences.append(sentence)
            result = ". ".join(new_sentences)
            if not result.endswith("."):
                result += "."
        return re.sub(r'\s+', ' ', result).strip()
    
    def humanize(self, text: str, use_post_processor: bool = True, passes: int = 2) -> Dict[str, Any]:
        self._load_humanizer()
        input_text = f"humanize: {text}"
        inputs = self._humanizer_tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512, padding=True)
        with torch.no_grad():
            outputs = self._humanizer_model.generate(
                **inputs,
                max_length=512,
                num_beams=4,
                do_sample=True,
                temperature=0.8,
                top_p=0.9,
                repetition_penalty=2.5,
                no_repeat_ngram_size=3
            )
        model_output = self._humanizer_tokenizer.decode(outputs[0], skip_special_tokens=True)
        final_output = self._apply_stealthwriter_postprocessor(model_output, passes) if use_post_processor else model_output
        original_words = text.lower().split()
        final_words = final_output.lower().split()
        changes = len(set(original_words).symmetric_difference(set(final_words)))
        return {
            "original_text": text,
            "model_output": model_output,
            "humanized_text": final_output,
            "changes_made": changes,
            "original_length": len(text),
            "humanized_length": len(final_output),
            "post_processor_used": use_post_processor,
            "passes": passes
        }
    
    def check_plagiarism(self, text: str, source_text: Optional[str] = None) -> Dict[str, Any]:
        self._load_plagiarism()
        if not source_text:
            return {
                "plagiarism_score": 0.0,
                "risk_level": "minimal",
                "sources_found": 0,
                "sources": [],
                "original_content_percentage": 100.0,
                "message": "No source text provided"
            }
        text_embedding = self._plagiarism_encoder.encode([text], convert_to_tensor=True)
        source_embedding = self._plagiarism_encoder.encode([source_text], convert_to_tensor=True)
        if self._plagiarism_classifier is not None:
            with torch.no_grad():
                plagiarism_prob = self._plagiarism_classifier(text_embedding, source_embedding).item()
            plagiarism_score = plagiarism_prob * 100
        else:
            similarity = torch.nn.functional.cosine_similarity(text_embedding, source_embedding).item()
            plagiarism_score = similarity * 100
        if plagiarism_score >= 70:
            risk_level = "high"
        elif plagiarism_score >= 50:
            risk_level = "medium"
        elif plagiarism_score >= 30:
            risk_level = "low"
        else:
            risk_level = "minimal"
        return {
            "plagiarism_score": round(plagiarism_score, 2),
            "risk_level": risk_level,
            "sources_found": 1 if plagiarism_score > 30 else 0,
            "sources": [{
                "url": "provided_source",
                "title": "Provided Source Text",
                "similarity_score": round(plagiarism_score, 2),
                "matched_text": source_text[:200] + "..." if len(source_text) > 200 else source_text
            }] if plagiarism_score > 30 else [],
            "original_content_percentage": round(100 - plagiarism_score, 2)
        }


# Singleton instance
ml_service = MLModelService()
