"""
A/B Testing Service for comparing model versions before deployment.
Part of Phase 3: Self-Learning ML System.
"""
import random
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.ab_test import ABTestAssignment, ABTestGroup
from app.models.model_version import ModelVersion, ModelStatus, ModelType

logger = logging.getLogger(__name__)


class ABTestingService:
    """A/B test new model versions before full deployment."""
    
    # Configuration
    TEST_DURATION_DAYS = 7
    TEST_GROUP_RATIO = 0.2  # 20% of users get new model
    MIN_SATISFACTION_IMPROVEMENT = 0.05  # 5% improvement required
    MAX_LATENCY_INCREASE = 0.20  # Max 20% slower allowed
    ROLLOUT_STAGES = [0.2, 0.5, 1.0]  # 20% -> 50% -> 100%
    ROLLOUT_STAGE_DURATION_HOURS = 48
    
    def __init__(self, db: Session):
        self.db = db
    
    def start_ab_test(self, model_type: str, new_version_id: int) -> Dict[str, Any]:
        """
        Start A/B test for a new model version.
        
        Args:
            model_type: 'detector', 'humanizer', or 'plagiarism'
            new_version_id: ID of new model version to test
            
        Returns:
            dict with test details
        """
        
        # Get current deployed model (control)
        control_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_type == ModelType(model_type),
            ModelVersion.status == ModelStatus.DEPLOYED
        ).first()
        
        if not control_version:
            raise ValueError(f"No deployed {model_type} model found")
        
        # Get new model version (test)
        test_version = self.db.query(ModelVersion).filter(
            ModelVersion.id == new_version_id
        ).first()
        
        if not test_version:
            raise ValueError(f"Model version {new_version_id} not found")
        
        # Update new model status
        test_version.status = ModelStatus.AB_TEST
        test_version.ab_test_start_date = datetime.utcnow()
        test_version.ab_test_end_date = datetime.utcnow() + timedelta(days=self.TEST_DURATION_DAYS)
        test_version.ab_test_requests = 0
        
        self.db.commit()
        
        logger.info(f"A/B test started: {model_type} {control_version.version_name} vs {test_version.version_name}")
        
        return {
            'status': 'started',
            'model_type': model_type,
            'control_version': control_version.version_name,
            'control_version_id': control_version.id,
            'test_version': test_version.version_name,
            'test_version_id': test_version.id,
            'test_duration_days': self.TEST_DURATION_DAYS,
            'test_group_ratio': self.TEST_GROUP_RATIO,
            'start_date': test_version.ab_test_start_date.isoformat(),
            'end_date': test_version.ab_test_end_date.isoformat()
        }
    
    def get_model_for_user(self, user_id: int, model_type: str) -> Dict[str, Any]:
        """
        Determine which model version to serve to a user.
        
        Args:
            user_id: ID of user
            model_type: 'detector', 'humanizer', or 'plagiarism'
            
        Returns:
            dict with model_version_id and version_name
        """
        
        # Check if there's an active A/B test
        test_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_type == ModelType(model_type),
            ModelVersion.status == ModelStatus.AB_TEST,
            ModelVersion.ab_test_end_date > datetime.utcnow()
        ).first()
        
        if not test_version:
            # No A/B test, return deployed model
            deployed = self.db.query(ModelVersion).filter(
                ModelVersion.model_type == ModelType(model_type),
                ModelVersion.status == ModelStatus.DEPLOYED
            ).first()
            
            if not deployed:
                # No deployed model, return None (use default)
                return {
                    'model_version_id': None,
                    'version_name': 'default',
                    'model_path': None,
                    'adapter_path': None,
                    'group': 'production',
                    'ab_test_active': False
                }
            
            return {
                'model_version_id': deployed.id,
                'version_name': deployed.version_name,
                'model_path': deployed.model_path,
                'adapter_path': deployed.adapter_path,
                'group': 'production',
                'ab_test_active': False
            }
        
        # A/B test active - check if user already assigned
        assignment = self.db.query(ABTestAssignment).filter(
            ABTestAssignment.user_id == user_id,
            ABTestAssignment.model_type == model_type,
            ABTestAssignment.expires_at > datetime.utcnow()
        ).first()
        
        if not assignment:
            # Assign user to control (80%) or test (20%) group
            control_version = self.db.query(ModelVersion).filter(
                ModelVersion.model_type == ModelType(model_type),
                ModelVersion.status == ModelStatus.DEPLOYED
            ).first()
            
            if not control_version:
                # Fallback if no control version
                control_version = test_version
            
            assigned_group = ABTestGroup.TEST if random.random() < self.TEST_GROUP_RATIO else ABTestGroup.CONTROL
            
            assignment = ABTestAssignment(
                user_id=user_id,
                model_type=model_type,
                control_version_id=control_version.id,
                test_version_id=test_version.id,
                assigned_group=assigned_group,
                assigned_at=datetime.utcnow(),
                expires_at=test_version.ab_test_end_date
            )
            
            self.db.add(assignment)
            self.db.commit()
            
            logger.debug(f"User {user_id} assigned to {assigned_group.value} group for {model_type}")
        
        # Return appropriate model
        if assignment.assigned_group == ABTestGroup.TEST:
            version = test_version
        else:
            version = self.db.query(ModelVersion).filter(
                ModelVersion.id == assignment.control_version_id
            ).first()
        
        # Update assignment metrics
        assignment.requests_count += 1
        self.db.commit()
        
        return {
            'model_version_id': version.id,
            'version_name': version.version_name,
            'model_path': version.model_path,
            'adapter_path': version.adapter_path,
            'group': assignment.assigned_group.value,
            'ab_test_active': True
        }
    
    def record_ab_test_feedback(self, user_id: int, model_type: str, is_positive: bool):
        """Record user feedback for A/B test."""
        
        assignment = self.db.query(ABTestAssignment).filter(
            ABTestAssignment.user_id == user_id,
            ABTestAssignment.model_type == model_type,
            ABTestAssignment.expires_at > datetime.utcnow()
        ).first()
        
        if assignment:
            assignment.feedback_count += 1
            if is_positive:
                assignment.positive_feedback += 1
            else:
                assignment.negative_feedback += 1
            
            self.db.commit()
            logger.debug(f"A/B test feedback recorded for user {user_id}: positive={is_positive}")
    
    def record_latency(self, user_id: int, model_type: str, latency_ms: float):
        """Record request latency for A/B test analysis."""
        
        assignment = self.db.query(ABTestAssignment).filter(
            ABTestAssignment.user_id == user_id,
            ABTestAssignment.model_type == model_type,
            ABTestAssignment.expires_at > datetime.utcnow()
        ).first()
        
        if assignment:
            # Update running average
            if assignment.avg_latency_ms is None:
                assignment.avg_latency_ms = latency_ms
            else:
                # Exponential moving average
                alpha = 0.1
                assignment.avg_latency_ms = alpha * latency_ms + (1 - alpha) * assignment.avg_latency_ms
            
            self.db.commit()
    
    def evaluate_ab_test(self, model_type: str) -> Dict[str, Any]:
        """
        Evaluate A/B test results and decide on deployment.
        
        Returns:
            dict with recommendation ('deploy', 'rollback', 'continue')
        """
        
        test_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_type == ModelType(model_type),
            ModelVersion.status == ModelStatus.AB_TEST
        ).first()
        
        if not test_version:
            return {'status': 'no_active_test', 'recommendation': None}
        
        # Get all assignments
        assignments = self.db.query(ABTestAssignment).filter(
            ABTestAssignment.test_version_id == test_version.id
        ).all()
        
        if not assignments:
            return {
                'status': 'insufficient_data',
                'recommendation': 'continue',
                'message': 'Not enough data to evaluate A/B test'
            }
        
        control_assignments = [a for a in assignments if a.assigned_group == ABTestGroup.CONTROL]
        test_assignments = [a for a in assignments if a.assigned_group == ABTestGroup.TEST]
        
        # Calculate metrics
        control_feedback_total = sum(a.feedback_count for a in control_assignments)
        test_feedback_total = sum(a.feedback_count for a in test_assignments)
        
        control_satisfaction = (
            sum(a.positive_feedback for a in control_assignments) / max(control_feedback_total, 1)
        )
        test_satisfaction = (
            sum(a.positive_feedback for a in test_assignments) / max(test_feedback_total, 1)
        )
        
        control_latencies = [a.avg_latency_ms for a in control_assignments if a.avg_latency_ms]
        test_latencies = [a.avg_latency_ms for a in test_assignments if a.avg_latency_ms]
        
        control_avg_latency = sum(control_latencies) / max(len(control_latencies), 1) if control_latencies else 0
        test_avg_latency = sum(test_latencies) / max(len(test_latencies), 1) if test_latencies else 0
        
        # Decision logic
        satisfaction_improvement = (
            (test_satisfaction - control_satisfaction) / control_satisfaction
            if control_satisfaction > 0 else 0
        )
        latency_change = (
            (test_avg_latency - control_avg_latency) / control_avg_latency
            if control_avg_latency > 0 else 0
        )
        
        # Deploy if: satisfaction improved by >5% AND latency didn't increase by >20%
        if satisfaction_improvement > self.MIN_SATISFACTION_IMPROVEMENT and latency_change < self.MAX_LATENCY_INCREASE:
            recommendation = 'deploy'
        elif satisfaction_improvement < -self.MIN_SATISFACTION_IMPROVEMENT or latency_change > 0.50:
            recommendation = 'rollback'
        else:
            recommendation = 'continue'
        
        # Update test version metrics
        test_version.ab_test_requests = sum(a.requests_count for a in test_assignments)
        test_version.ab_test_avg_accuracy = test_satisfaction
        test_version.ab_test_avg_latency_ms = test_avg_latency
        test_version.ab_test_user_satisfaction = test_satisfaction
        
        self.db.commit()
        
        logger.info(f"A/B test evaluation for {model_type}: recommendation={recommendation}")
        
        return {
            'status': 'evaluated',
            'recommendation': recommendation,
            'test_version': test_version.version_name,
            'test_version_id': test_version.id,
            'control_satisfaction': round(control_satisfaction * 100, 2),
            'test_satisfaction': round(test_satisfaction * 100, 2),
            'satisfaction_improvement_percent': round(satisfaction_improvement * 100, 2),
            'control_latency_ms': round(control_avg_latency, 2),
            'test_latency_ms': round(test_avg_latency, 2),
            'latency_change_percent': round(latency_change * 100, 2),
            'total_test_requests': test_version.ab_test_requests,
            'control_users': len(control_assignments),
            'test_users': len(test_assignments),
            'days_remaining': max(0, (test_version.ab_test_end_date - datetime.utcnow()).days) if test_version.ab_test_end_date else 0
        }
    
    def deploy_test_version(self, model_type: str) -> Dict[str, Any]:
        """Promote test version to production."""
        
        test_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_type == ModelType(model_type),
            ModelVersion.status == ModelStatus.AB_TEST
        ).first()
        
        if not test_version:
            raise ValueError("No active A/B test found")
        
        # Archive old deployed version
        old_deployed = self.db.query(ModelVersion).filter(
            ModelVersion.model_type == ModelType(model_type),
            ModelVersion.status == ModelStatus.DEPLOYED
        ).first()
        
        old_version_name = None
        if old_deployed:
            old_deployed.status = ModelStatus.ARCHIVED
            old_deployed.archived_at = datetime.utcnow()
            old_version_name = old_deployed.version_name
        
        # Promote test version
        test_version.status = ModelStatus.DEPLOYED
        test_version.deployed_at = datetime.utcnow()
        
        # Clear A/B test assignments
        self.db.query(ABTestAssignment).filter(
            ABTestAssignment.test_version_id == test_version.id
        ).delete()
        
        self.db.commit()
        
        logger.info(f"Deployed {test_version.version_name} for {model_type}, archived {old_version_name}")
        
        return {
            'status': 'deployed',
            'new_version': test_version.version_name,
            'new_version_id': test_version.id,
            'old_version': old_version_name,
            'deployed_at': test_version.deployed_at.isoformat()
        }
    
    def rollback_test_version(self, model_type: str) -> Dict[str, Any]:
        """Rollback failed A/B test."""
        
        test_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_type == ModelType(model_type),
            ModelVersion.status == ModelStatus.AB_TEST
        ).first()
        
        version_name = None
        if test_version:
            test_version.status = ModelStatus.FAILED
            test_version.notes = 'A/B test failed - rolled back'
            version_name = test_version.version_name
            
            # Clear A/B test assignments
            self.db.query(ABTestAssignment).filter(
                ABTestAssignment.test_version_id == test_version.id
            ).delete()
            
            self.db.commit()
            
            logger.info(f"Rolled back A/B test for {model_type}: {version_name}")
        
        return {
            'status': 'rolled_back',
            'version': version_name
        }
    
    def get_user_assignment(self, user_id: int, model_type: str) -> Optional[Dict[str, Any]]:
        """
        Get user's A/B test assignment for ML service integration.
        
        Args:
            user_id: User ID
            model_type: 'detector', 'humanizer', or 'plagiarism'
            
        Returns:
            Dict with version_name, is_test_group, adapter_path, ab_test_id or None
        """
        # Use existing get_model_for_user method
        result = self.get_model_for_user(user_id, model_type)
        
        if not result or result.get('model_version_id') is None:
            return None
        
        return {
            'version_name': result.get('version_name'),
            'is_test_group': result.get('group') == 'test',
            'adapter_path': result.get('adapter_path'),
            'ab_test_id': result.get('model_version_id') if result.get('ab_test_active') else None
        }
    
    def record_scan_with_version(
        self,
        user_id: int,
        model_type: str,
        version_name: str,
        scan_id: int
    ):
        """
        Record that a scan was performed with a specific model version.
        Used for A/B test analysis and model performance tracking.
        """
        # Find the assignment
        assignment = self.db.query(ABTestAssignment).filter(
            ABTestAssignment.user_id == user_id,
            ABTestAssignment.model_type == model_type,
            ABTestAssignment.expires_at > datetime.utcnow()
        ).first()
        
        if assignment:
            assignment.requests_count += 1
            self.db.commit()
            logger.debug(f"Recorded scan {scan_id} with version {version_name} for user {user_id}")
    
    def get_active_tests(self) -> list:
        """Get all active A/B tests."""
        
        active_tests = self.db.query(ModelVersion).filter(
            ModelVersion.status == ModelStatus.AB_TEST,
            ModelVersion.ab_test_end_date > datetime.utcnow()
        ).all()
        
        results = []
        for test in active_tests:
            # Get control version
            control = self.db.query(ModelVersion).filter(
                ModelVersion.model_type == test.model_type,
                ModelVersion.status == ModelStatus.DEPLOYED
            ).first()
            
            # Get assignment counts
            test_users = self.db.query(ABTestAssignment).filter(
                ABTestAssignment.test_version_id == test.id,
                ABTestAssignment.assigned_group == ABTestGroup.TEST
            ).count()
            
            control_users = self.db.query(ABTestAssignment).filter(
                ABTestAssignment.test_version_id == test.id,
                ABTestAssignment.assigned_group == ABTestGroup.CONTROL
            ).count()
            
            results.append({
                'model_type': test.model_type.value,
                'test_version': test.version_name,
                'test_version_id': test.id,
                'control_version': control.version_name if control else 'N/A',
                'control_version_id': control.id if control else None,
                'start_date': test.ab_test_start_date.isoformat() if test.ab_test_start_date else None,
                'end_date': test.ab_test_end_date.isoformat() if test.ab_test_end_date else None,
                'days_remaining': max(0, (test.ab_test_end_date - datetime.utcnow()).days) if test.ab_test_end_date else 0,
                'test_users': test_users,
                'control_users': control_users,
                'total_requests': test.ab_test_requests or 0
            })
        
        return results
