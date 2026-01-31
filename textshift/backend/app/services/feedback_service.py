"""
Feedback Service for collecting and processing user feedback for model improvement.
Part of Phase 3: Self-Learning ML System.
"""
import hashlib
import re
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.feedback import UserFeedback, FeedbackType
from app.models.training_sample import TrainingSampleQueue, SampleStatus, SampleSourceType
from app.models.scan import Scan

logger = logging.getLogger(__name__)


class FeedbackService:
    """Collect and process user feedback for model improvement."""
    
    # Configuration
    AUTO_VALIDATE_CONFIDENCE_THRESHOLD = 0.8
    AUTO_VALIDATE_DUPLICATE_THRESHOLD = 3
    MIN_TEXT_LENGTH_WORDS = 10
    MAX_TEXT_LENGTH_WORDS = 5000
    MAX_FEEDBACK_PER_USER_PER_DAY = 20
    
    def __init__(self, db: Session):
        self.db = db
    
    def submit_feedback(
        self,
        scan_id: int,
        user_id: int,
        feedback_type: str,
        is_correct: Optional[bool] = None,
        correct_label: Optional[str] = None,
        confidence_rating: Optional[int] = None,
        user_comment: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit user feedback on a scan result.
        
        Args:
            scan_id: ID of the scan
            user_id: ID of the user
            feedback_type: Type of feedback ('incorrect_prediction', 'false_positive', etc.)
            is_correct: Whether user thinks prediction was correct
            correct_label: What user says correct label should be
            confidence_rating: User confidence 1-5
            user_comment: Free-form feedback text
            ip_address: User's IP (for spam detection)
            user_agent: User agent string
            
        Returns:
            dict with feedback_id and status
        """
        
        # Check rate limit
        if self._is_rate_limited(user_id):
            return {
                'status': 'rate_limited',
                'message': f'Maximum {self.MAX_FEEDBACK_PER_USER_PER_DAY} feedback submissions per day'
            }
        
        # Get scan details
        scan = self.db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            raise ValueError(f"Scan {scan_id} not found")
        
        # Verify user owns the scan
        if scan.user_id != user_id:
            raise ValueError("User does not own this scan")
        
        # Parse feedback type
        try:
            fb_type = FeedbackType(feedback_type)
        except ValueError:
            raise ValueError(f"Invalid feedback type: {feedback_type}")
        
        # Extract model prediction and confidence from scan results
        model_prediction = None
        model_confidence = None
        
        if scan.results:
            if scan.scan_type.value == 'ai_detection':
                model_prediction = scan.results.get('verdict') or scan.results.get('label')
                model_confidence = scan.results.get('ai_probability')
            elif scan.scan_type.value == 'plagiarism':
                model_prediction = scan.results.get('risk_level')
                model_confidence = scan.results.get('plagiarism_score')
            elif scan.scan_type.value == 'humanize':
                model_prediction = 'humanized'
                model_confidence = None
        
        # Create feedback record
        feedback = UserFeedback(
            scan_id=scan_id,
            user_id=user_id,
            feedback_type=fb_type,
            is_correct=is_correct,
            correct_label=correct_label,
            confidence_rating=confidence_rating,
            user_comment=user_comment,
            model_prediction=model_prediction,
            model_confidence=model_confidence,
            scan_type=scan.scan_type.value,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow()
        )
        
        self.db.add(feedback)
        self.db.flush()  # Get the ID
        
        # If feedback indicates wrong prediction, add to training queue
        added_to_training = False
        if feedback_type in ['incorrect_prediction', 'false_positive', 'false_negative'] and correct_label:
            self._add_to_training_queue(
                model_type=scan.scan_type.value.replace('ai_detection', 'detector'),
                input_text=scan.input_text,
                correct_label=correct_label,
                source_id=feedback.id,
                confidence=confidence_rating or 3
            )
            added_to_training = True
        
        self.db.commit()
        
        logger.info(f"Feedback submitted: type={feedback_type}, scan_id={scan_id}, user_id={user_id}")
        
        return {
            'feedback_id': feedback.id,
            'status': 'submitted',
            'added_to_training': added_to_training,
            'message': 'Thank you for your feedback! It helps improve our models.'
        }
    
    def _is_rate_limited(self, user_id: int) -> bool:
        """Check if user has exceeded daily feedback limit."""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        today_count = self.db.query(UserFeedback).filter(
            UserFeedback.user_id == user_id,
            UserFeedback.created_at >= today_start
        ).count()
        
        return today_count >= self.MAX_FEEDBACK_PER_USER_PER_DAY
    
    def _add_to_training_queue(
        self,
        model_type: str,
        input_text: str,
        correct_label: str,
        source_id: int,
        confidence: int
    ):
        """Add sample to training queue if not duplicate."""
        
        # Validate text length
        word_count = len(input_text.split())
        if word_count < self.MIN_TEXT_LENGTH_WORDS or word_count > self.MAX_TEXT_LENGTH_WORDS:
            logger.debug(f"Text length {word_count} outside valid range, skipping")
            return
        
        # Check for duplicates (exact text match)
        existing = self.db.query(TrainingSampleQueue).filter(
            TrainingSampleQueue.model_type == model_type,
            TrainingSampleQueue.input_text == input_text
        ).first()
        
        if existing:
            # Increment duplicate count and update confidence
            existing.duplicate_count += 1
            existing.confidence_score = max(existing.confidence_score or 0, confidence / 5.0)
            logger.debug(f"Duplicate sample found, count now {existing.duplicate_count}")
        else:
            # Detect scenario tags
            scenario_tags = self._auto_categorize_scenario(input_text)
            
            # Create new queue entry
            sample = TrainingSampleQueue(
                model_type=model_type,
                input_text=input_text,
                correct_label=correct_label,
                source_type=SampleSourceType.USER_FEEDBACK,
                source_id=source_id,
                confidence_score=confidence / 5.0,  # Normalize to 0-1
                scenario_tags=scenario_tags,
                status=SampleStatus.PENDING,
                created_at=datetime.utcnow()
            )
            self.db.add(sample)
            logger.debug(f"New training sample added: model_type={model_type}, label={correct_label}")
    
    def _auto_categorize_scenario(self, text: str) -> str:
        """Automatically detect which learning scenario applies (20+ scenarios)."""
        
        scenarios = []
        word_count = len(text.split())
        
        # Scenario 9: Code snippets
        if self._contains_code(text):
            scenarios.append('code_snippet')
        
        # Scenario 10: Poetry/Creative
        if self._is_poetry(text):
            scenarios.append('poetry')
        
        # Scenario 4: Domain-specific
        domain = self._detect_domain(text)
        if domain != 'general':
            scenarios.append(f'domain_{domain}')
        
        # Scenario 14: Academic abstract
        if self._is_academic_abstract(text):
            scenarios.append('academic_abstract')
        
        # Scenario 15: Social media
        if self._is_social_media_text(text):
            scenarios.append('social_media')
        
        # Scenario 17: ESL writing
        if self._detect_esl_patterns(text):
            scenarios.append('esl_writing')
        
        # Scenario 20: Length variations
        if word_count < 100:
            scenarios.append('short_text')
        elif word_count > 2000:
            scenarios.append('long_text')
        
        return ','.join(scenarios) if scenarios else 'general'
    
    def _contains_code(self, text: str) -> bool:
        """Detect if text contains code snippets."""
        code_indicators = [
            'def ', 'class ', 'import ', 'function', '{ }', '( )',
            'return ', 'const ', 'let ', 'var ', '<?php', '<script>',
            'public static', 'private void', '#include', 'SELECT ', 'FROM '
        ]
        return any(indicator in text for indicator in code_indicators)
    
    def _is_poetry(self, text: str) -> bool:
        """Detect if text is poetry."""
        lines = text.strip().split('\n')
        
        if len(lines) < 4:
            return False
        
        avg_line_length = sum(len(line) for line in lines) / len(lines)
        short_lines = sum(1 for line in lines if len(line) < 60)
        
        return avg_line_length < 50 and short_lines / len(lines) > 0.7
    
    def _detect_domain(self, text: str) -> str:
        """Detect text domain (legal, medical, technical, general)."""
        legal_keywords = ['pursuant', 'herein', 'thereof', 'plaintiff', 'defendant', 'jurisdiction']
        medical_keywords = ['diagnosis', 'symptoms', 'treatment', 'patient', 'clinical', 'prognosis']
        technical_keywords = ['algorithm', 'implementation', 'function', 'protocol', 'architecture', 'API']
        
        text_lower = text.lower()
        
        if sum(1 for kw in legal_keywords if kw in text_lower) >= 2:
            return 'legal'
        elif sum(1 for kw in medical_keywords if kw in text_lower) >= 2:
            return 'medical'
        elif sum(1 for kw in technical_keywords if kw in text_lower) >= 2:
            return 'technical'
        else:
            return 'general'
    
    def _is_academic_abstract(self, text: str) -> bool:
        """Detect academic abstract style."""
        academic_markers = [
            'abstract', 'introduction', 'methodology', 'results', 'conclusion',
            'study', 'research', 'findings', 'analysis', 'hypothesis'
        ]
        
        text_lower = text.lower()
        marker_count = sum(1 for marker in academic_markers if marker in text_lower)
        
        formal_indicators = ['was found', 'were observed', 'it is', 'this study', 'the results']
        formal_count = sum(1 for ind in formal_indicators if ind in text_lower)
        
        return marker_count >= 2 and formal_count >= 2
    
    def _is_social_media_text(self, text: str) -> bool:
        """Detect social media style text."""
        social_indicators = [
            'lol', 'omg', 'tbh', 'imo', 'btw', 'smh', 'fr', 'ngl',
            '!!!', '???', '#', '@'
        ]
        
        return sum(1 for ind in social_indicators if ind in text.lower()) >= 2
    
    def _detect_esl_patterns(self, text: str) -> bool:
        """Detect ESL (English as Second Language) writing patterns."""
        words = text.split()
        if not words:
            return False
        
        esl_markers = [
            text.count(' a ') / max(len(words), 1) > 0.05,  # Overuse of 'a'
            'will' in text and 'was' in text,  # Tense inconsistencies
            ' very much' in text,  # Word order issues
        ]
        
        return sum(esl_markers) >= 2
    
    def get_training_ready_samples(self, model_type: str, min_samples: int = 100) -> List[TrainingSampleQueue]:
        """
        Get samples ready for training.
        
        Args:
            model_type: 'detector', 'humanizer', or 'plagiarism'
            min_samples: Minimum samples required to trigger training
            
        Returns:
            List of validated training samples
        """
        
        samples = self.db.query(TrainingSampleQueue).filter(
            TrainingSampleQueue.model_type == model_type,
            TrainingSampleQueue.status == SampleStatus.VALIDATED,
            TrainingSampleQueue.used_in_training_run_id.is_(None)
        ).all()
        
        if len(samples) < min_samples:
            return []
        
        # Filter spam/low-quality
        quality_samples = [
            s for s in samples
            if (s.confidence_score or 0) >= 0.6  # At least 60% confident
            and len(s.input_text.split()) >= self.MIN_TEXT_LENGTH_WORDS
        ]
        
        return quality_samples
    
    def validate_queue_samples(self, model_type: str) -> Dict[str, int]:
        """
        Auto-validate high-confidence samples.
        Admin can manually review low-confidence ones.
        
        Returns:
            dict with counts of validated and rejected samples
        """
        
        pending_samples = self.db.query(TrainingSampleQueue).filter(
            TrainingSampleQueue.model_type == model_type,
            TrainingSampleQueue.status == SampleStatus.PENDING
        ).all()
        
        validated_count = 0
        rejected_count = 0
        
        for sample in pending_samples:
            confidence = sample.confidence_score or 0
            
            # Auto-validate if high confidence and multiple reports
            if confidence >= self.AUTO_VALIDATE_CONFIDENCE_THRESHOLD or sample.duplicate_count >= self.AUTO_VALIDATE_DUPLICATE_THRESHOLD:
                sample.status = SampleStatus.VALIDATED
                sample.validated_by = 'auto'
                validated_count += 1
            elif confidence < 0.4:
                # Reject very low confidence
                sample.status = SampleStatus.REJECTED
                sample.rejection_reason = 'Low confidence score'
                rejected_count += 1
        
        self.db.commit()
        
        logger.info(f"Validated {validated_count} samples, rejected {rejected_count} for {model_type}")
        
        return {
            'validated': validated_count,
            'rejected': rejected_count,
            'pending': len(pending_samples) - validated_count - rejected_count
        }
    
    def get_feedback_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get feedback statistics for admin dashboard."""
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Feedback counts by type
        feedback_counts = self.db.query(
            UserFeedback.feedback_type,
            func.count(UserFeedback.id)
        ).filter(
            UserFeedback.created_at >= start_date
        ).group_by(UserFeedback.feedback_type).all()
        
        # Training queue status
        queue_status = self.db.query(
            TrainingSampleQueue.status,
            func.count(TrainingSampleQueue.id)
        ).group_by(TrainingSampleQueue.status).all()
        
        # Feedback by scan type
        feedback_by_scan_type = self.db.query(
            UserFeedback.scan_type,
            func.count(UserFeedback.id)
        ).filter(
            UserFeedback.created_at >= start_date
        ).group_by(UserFeedback.scan_type).all()
        
        return {
            'feedback_by_type': {str(ftype.value) if ftype else 'unknown': count for ftype, count in feedback_counts},
            'queue_status': {str(status.value) if status else 'unknown': count for status, count in queue_status},
            'feedback_by_scan_type': {stype or 'unknown': count for stype, count in feedback_by_scan_type},
            'total_feedback': sum(count for _, count in feedback_counts),
            'ready_for_training': dict(queue_status).get(SampleStatus.VALIDATED, 0) if queue_status else 0,
            'period_days': days
        }
