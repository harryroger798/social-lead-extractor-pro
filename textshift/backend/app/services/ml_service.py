import os
import gc
import torch
import logging
from typing import Optional, Dict, Any, List
from transformers import AutoTokenizer, AutoModelForSequenceClassification, T5Tokenizer, T5ForConditionalGeneration
from sentence_transformers import SentenceTransformer
import numpy as np
from app.core.config import settings

logger = logging.getLogger(__name__)


class MLModelService:
    """
    Singleton service for managing ML models with lazy loading.
    Only one model is loaded at a time to conserve memory on the $6 droplet.
    """
    
    _instance = None
    _current_model: Optional[str] = None
    
    # Model instances
    _detector_model = None
    _detector_tokenizer = None
    _humanizer_model = None
    _humanizer_tokenizer = None
    _plagiarism_model = None
    _plagiarism_classifier = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _unload_all_models(self):
        """Unload all models to free memory."""
        logger.info("Unloading all models...")
        
        self._detector_model = None
        self._detector_tokenizer = None
        self._humanizer_model = None
        self._humanizer_tokenizer = None
        self._plagiarism_model = None
        self._plagiarism_classifier = None
        
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        self._current_model = None
        logger.info("All models unloaded")
    
    def _load_detector(self):
        """Load AI detector model (RoBERTa)."""
        if self._current_model != "detector":
            self._unload_all_models()
            
            logger.info("Loading AI detector model...")
            model_path = settings.DETECTOR_MODEL_PATH
            
            if os.path.exists(model_path):
                self._detector_tokenizer = AutoTokenizer.from_pretrained(model_path)
                self._detector_model = AutoModelForSequenceClassification.from_pretrained(
                    model_path,
                    torch_dtype=torch.float32
                )
                self._detector_model.eval()
            else:
                # Fallback to HuggingFace
                logger.warning(f"Local model not found at {model_path}, using HuggingFace")
                self._detector_tokenizer = AutoTokenizer.from_pretrained("roberta-base")
                self._detector_model = AutoModelForSequenceClassification.from_pretrained(
                    "roberta-base",
                    num_labels=2
                )
            
            self._current_model = "detector"
            logger.info("AI detector model loaded")
    
    def _load_humanizer(self):
        """Load humanizer model (T5)."""
        if self._current_model != "humanizer":
            self._unload_all_models()
            
            logger.info("Loading humanizer model...")
            model_path = settings.HUMANIZER_MODEL_PATH
            
            if os.path.exists(model_path):
                self._humanizer_tokenizer = T5Tokenizer.from_pretrained(model_path)
                self._humanizer_model = T5ForConditionalGeneration.from_pretrained(
                    model_path,
                    torch_dtype=torch.float32
                )
                self._humanizer_model.eval()
            else:
                # Fallback to base T5
                logger.warning(f"Local model not found at {model_path}, using base T5")
                self._humanizer_tokenizer = T5Tokenizer.from_pretrained("t5-base")
                self._humanizer_model = T5ForConditionalGeneration.from_pretrained("t5-base")
            
            self._current_model = "humanizer"
            logger.info("Humanizer model loaded")
    
    def _load_plagiarism(self):
        """Load plagiarism detection model (Sentence-BERT)."""
        if self._current_model != "plagiarism":
            self._unload_all_models()
            
            logger.info("Loading plagiarism model...")
            model_path = settings.PLAGIARISM_MODEL_PATH
            
            # Load sentence transformer
            self._plagiarism_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Load classifier if exists
            classifier_path = os.path.join(model_path, "plagiarism_classifier.pt")
            if os.path.exists(classifier_path):
                self._plagiarism_classifier = torch.load(classifier_path, map_location='cpu')
                logger.info("Loaded custom plagiarism classifier")
            
            self._current_model = "plagiarism"
            logger.info("Plagiarism model loaded")
    
    def detect_ai(self, text: str) -> Dict[str, Any]:
        """
        Detect if text is AI-generated.
        Returns probability and confidence analysis.
        """
        self._load_detector()
        
        # Tokenize
        inputs = self._detector_tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        
        # Inference
        with torch.no_grad():
            outputs = self._detector_model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
        
        # Get probabilities (assuming label 0 = human, 1 = AI)
        human_prob = probabilities[0][0].item()
        ai_prob = probabilities[0][1].item()
        
        # Calculate confidence level (1-10 scale)
        confidence_score = self._calculate_confidence_score(ai_prob)
        confidence_level = self._get_confidence_level(confidence_score)
        
        # Sentence-level analysis
        sentence_analysis = self._analyze_sentences(text)
        
        return {
            "ai_probability": round(ai_prob * 100, 2),
            "human_probability": round(human_prob * 100, 2),
            "confidence_score": confidence_score,
            "confidence_level": confidence_level,
            "analysis": {
                "text_length": len(text),
                "word_count": len(text.split()),
                "avg_sentence_length": self._avg_sentence_length(text),
            },
            "sentence_analysis": sentence_analysis
        }
    
    def _calculate_confidence_score(self, ai_prob: float) -> int:
        """Convert AI probability to 1-10 confidence score."""
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
        """Convert score to confidence level string."""
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
        """Calculate average sentence length."""
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        if not sentences:
            return 0
        return sum(len(s.split()) for s in sentences) / len(sentences)
    
    def _analyze_sentences(self, text: str) -> List[Dict[str, Any]]:
        """Analyze individual sentences for AI probability."""
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]
        
        results = []
        for sentence in sentences[:10]:  # Limit to first 10 sentences
            inputs = self._detector_tokenizer(
                sentence,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            with torch.no_grad():
                outputs = self._detector_model(**inputs)
                probs = torch.softmax(outputs.logits, dim=-1)
            
            results.append({
                "text": sentence[:100] + "..." if len(sentence) > 100 else sentence,
                "ai_probability": round(probs[0][1].item() * 100, 2)
            })
        
        return results
    
    def humanize(self, text: str) -> Dict[str, Any]:
        """
        Humanize AI-generated text.
        Returns original and humanized text with changes count.
        """
        self._load_humanizer()
        
        # Prepare input
        input_text = f"paraphrase: {text}"
        
        inputs = self._humanizer_tokenizer(
            input_text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        
        # Generate humanized text
        with torch.no_grad():
            outputs = self._humanizer_model.generate(
                **inputs,
                max_length=512,
                num_beams=4,
                temperature=0.8,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.2
            )
        
        humanized_text = self._humanizer_tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Count changes (simple word-level diff)
        original_words = set(text.lower().split())
        humanized_words = set(humanized_text.lower().split())
        changes = len(original_words.symmetric_difference(humanized_words))
        
        return {
            "original_text": text,
            "humanized_text": humanized_text,
            "changes_made": changes,
            "original_length": len(text),
            "humanized_length": len(humanized_text)
        }
    
    def check_plagiarism(self, text: str, sources: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Check text for plagiarism against sources.
        Returns plagiarism score and matched sources.
        """
        self._load_plagiarism()
        
        # Encode the input text
        text_embedding = self._plagiarism_model.encode(text, convert_to_tensor=True)
        
        matched_sources = []
        max_similarity = 0.0
        
        if sources:
            for source in sources:
                source_embedding = self._plagiarism_model.encode(source, convert_to_tensor=True)
                similarity = torch.nn.functional.cosine_similarity(
                    text_embedding.unsqueeze(0),
                    source_embedding.unsqueeze(0)
                ).item()
                
                if similarity > 0.3:  # Threshold for potential match
                    matched_sources.append({
                        "url": "internal_source",
                        "title": "Provided Source",
                        "similarity_score": round(similarity * 100, 2),
                        "matched_text": source[:200] + "..." if len(source) > 200 else source
                    })
                
                max_similarity = max(max_similarity, similarity)
        
        # Calculate plagiarism score
        plagiarism_score = max_similarity * 100
        
        # Determine risk level
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
            "sources_found": len(matched_sources),
            "sources": matched_sources,
            "original_content_percentage": round(100 - plagiarism_score, 2)
        }


# Singleton instance
ml_service = MLModelService()
