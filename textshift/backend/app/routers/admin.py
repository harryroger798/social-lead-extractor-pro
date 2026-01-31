"""
Admin API endpoints for ML monitoring and management.
Part of Phase 3: Self-Learning ML System.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.feedback_service import FeedbackService
from app.services.training_pipeline import TrainingPipeline
from app.services.ab_testing_service import ABTestingService

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin access."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ============== Training Status & Management ==============

class TrainingStatusResponse(BaseModel):
    model_type: str
    samples: Dict[str, int]
    ready_for_training: bool
    min_samples_required: int
    latest_training_run: Optional[Dict[str, Any]]
    deployed_model: Optional[Dict[str, Any]]


class TrainingTriggerRequest(BaseModel):
    model_type: str


class TrainingTriggerResponse(BaseModel):
    status: str
    training_run_id: Optional[int]
    new_model_version: Optional[str]
    accuracy: Optional[float]
    improvement: Optional[float]
    samples_used: Optional[int]
    duration_minutes: Optional[int]
    error: Optional[str]


@router.get("/training/status/{model_type}", response_model=TrainingStatusResponse)
async def get_training_status(
    model_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get training status for a specific model type."""
    
    if model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    pipeline = TrainingPipeline(db)
    status = pipeline.get_training_status(model_type)
    
    return TrainingStatusResponse(**status)


@router.get("/training/status")
async def get_all_training_status(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get training status for all model types."""
    
    pipeline = TrainingPipeline(db)
    
    return {
        'detector': pipeline.get_training_status('detector'),
        'humanizer': pipeline.get_training_status('humanizer'),
        'plagiarism': pipeline.get_training_status('plagiarism')
    }


@router.post("/training/trigger", response_model=TrainingTriggerResponse)
async def trigger_training(
    request: TrainingTriggerRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Manually trigger training for a model type."""
    
    if request.model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    pipeline = TrainingPipeline(db)
    
    # Check if enough samples
    if not pipeline.should_trigger_training(request.model_type):
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough samples for training. Need at least {pipeline.MIN_TRAINING_SAMPLES} validated samples."
        )
    
    result = pipeline.run_incremental_training(
        model_type=request.model_type,
        triggered_by='manual',
        triggered_by_user_id=admin.id
    )
    
    return TrainingTriggerResponse(**result)


@router.get("/training/history")
async def get_training_history(
    model_type: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get training run history."""
    
    pipeline = TrainingPipeline(db)
    history = pipeline.get_training_history(model_type=model_type, limit=limit)
    
    return {'training_runs': history}


@router.get("/models/versions")
async def get_model_versions(
    model_type: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all model versions."""
    
    pipeline = TrainingPipeline(db)
    versions = pipeline.get_model_versions(model_type=model_type)
    
    return {'model_versions': versions}


# ============== A/B Testing ==============

class ABTestStartRequest(BaseModel):
    model_type: str
    new_version_id: int


@router.get("/ab-tests")
async def get_active_ab_tests(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all active A/B tests."""
    
    ab_service = ABTestingService(db)
    tests = ab_service.get_active_tests()
    
    return {'active_tests': tests}


@router.post("/ab-tests/start")
async def start_ab_test(
    request: ABTestStartRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Start a new A/B test for a model version."""
    
    if request.model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    ab_service = ABTestingService(db)
    
    try:
        result = ab_service.start_ab_test(request.model_type, request.new_version_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ab-tests/evaluate/{model_type}")
async def evaluate_ab_test(
    model_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Evaluate A/B test results and get deployment recommendation."""
    
    if model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    ab_service = ABTestingService(db)
    result = ab_service.evaluate_ab_test(model_type)
    
    return result


@router.post("/ab-tests/deploy/{model_type}")
async def deploy_ab_test_winner(
    model_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Deploy the winning A/B test version to production."""
    
    if model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    ab_service = ABTestingService(db)
    
    try:
        result = ab_service.deploy_test_version(model_type)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ab-tests/rollback/{model_type}")
async def rollback_ab_test(
    model_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Rollback a failed A/B test."""
    
    if model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    ab_service = ABTestingService(db)
    result = ab_service.rollback_test_version(model_type)
    
    return result


# ============== Feedback & Metrics ==============

@router.get("/feedback/stats")
async def get_feedback_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get feedback statistics for admin dashboard."""
    
    feedback_service = FeedbackService(db)
    stats = feedback_service.get_feedback_stats(days=days)
    
    return stats


@router.post("/feedback/validate/{model_type}")
async def validate_feedback_samples(
    model_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Auto-validate pending feedback samples."""
    
    if model_type not in ['detector', 'humanizer', 'plagiarism']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    feedback_service = FeedbackService(db)
    result = feedback_service.validate_queue_samples(model_type)
    
    return result


@router.get("/metrics/overview")
async def get_metrics_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get overall ML system metrics overview."""
    
    pipeline = TrainingPipeline(db)
    ab_service = ABTestingService(db)
    feedback_service = FeedbackService(db)
    
    # Get status for all models
    detector_status = pipeline.get_training_status('detector')
    humanizer_status = pipeline.get_training_status('humanizer')
    plagiarism_status = pipeline.get_training_status('plagiarism')
    
    # Get active A/B tests
    active_tests = ab_service.get_active_tests()
    
    # Get feedback stats
    feedback_stats = feedback_service.get_feedback_stats(days=30)
    
    return {
        'models': {
            'detector': {
                'deployed_version': detector_status.get('deployed_model', {}).get('version') if detector_status.get('deployed_model') else None,
                'accuracy': detector_status.get('deployed_model', {}).get('accuracy') if detector_status.get('deployed_model') else None,
                'samples_ready': detector_status.get('samples', {}).get('validated', 0),
                'ready_for_training': detector_status.get('ready_for_training', False)
            },
            'humanizer': {
                'deployed_version': humanizer_status.get('deployed_model', {}).get('version') if humanizer_status.get('deployed_model') else None,
                'accuracy': humanizer_status.get('deployed_model', {}).get('accuracy') if humanizer_status.get('deployed_model') else None,
                'samples_ready': humanizer_status.get('samples', {}).get('validated', 0),
                'ready_for_training': humanizer_status.get('ready_for_training', False)
            },
            'plagiarism': {
                'deployed_version': plagiarism_status.get('deployed_model', {}).get('version') if plagiarism_status.get('deployed_model') else None,
                'accuracy': plagiarism_status.get('deployed_model', {}).get('accuracy') if plagiarism_status.get('deployed_model') else None,
                'samples_ready': plagiarism_status.get('samples', {}).get('validated', 0),
                'ready_for_training': plagiarism_status.get('ready_for_training', False)
            }
        },
        'active_ab_tests': len(active_tests),
        'ab_tests': active_tests,
        'feedback': {
            'total_last_30_days': feedback_stats.get('total_feedback', 0),
            'by_type': feedback_stats.get('feedback_by_type', {}),
            'by_scan_type': feedback_stats.get('feedback_by_scan_type', {}),
            'ready_for_training': feedback_stats.get('ready_for_training', 0)
        },
        'system_health': {
            'status': 'healthy',
            'last_updated': datetime.utcnow().isoformat()
        }
    }
