"""
Feedback API endpoints for collecting user feedback on scan results.
Part of Phase 3: Self-Learning ML System.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.feedback import UserFeedback
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class FeedbackSubmitRequest(BaseModel):
    scan_id: int
    feedback_type: str = Field(..., description="Type: incorrect_prediction, false_positive, false_negative, report_issue, good_result, poor_quality")
    is_correct: Optional[bool] = None
    correct_label: Optional[str] = None
    confidence_rating: Optional[int] = Field(None, ge=1, le=5)
    user_comment: Optional[str] = Field(None, max_length=1000)


class FeedbackResponse(BaseModel):
    feedback_id: int
    status: str
    added_to_training: bool
    message: str


class FeedbackHistoryItem(BaseModel):
    id: int
    scan_id: int
    feedback_type: str
    is_correct: Optional[bool]
    correct_label: Optional[str]
    confidence_rating: Optional[int]
    user_comment: Optional[str]
    model_prediction: Optional[str]
    model_confidence: Optional[float]
    scan_type: Optional[str]
    created_at: datetime


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    request: Request,
    feedback_data: FeedbackSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback on a scan result.
    
    This helps improve our AI models by learning from user corrections.
    """
    try:
        # Get client info for spam detection
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        feedback_service = FeedbackService(db)
        result = feedback_service.submit_feedback(
            scan_id=feedback_data.scan_id,
            user_id=current_user.id,
            feedback_type=feedback_data.feedback_type,
            is_correct=feedback_data.is_correct,
            correct_label=feedback_data.correct_label,
            confidence_rating=feedback_data.confidence_rating,
            user_comment=feedback_data.user_comment,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if result.get('status') == 'rate_limited':
            raise HTTPException(status_code=429, detail=result.get('message'))
        
        return FeedbackResponse(
            feedback_id=result.get('feedback_id', 0),
            status=result.get('status', 'submitted'),
            added_to_training=result.get('added_to_training', False),
            message=result.get('message', 'Feedback submitted')
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")


@router.get("/history", response_model=List[FeedbackHistoryItem])
async def get_feedback_history(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's feedback history."""
    
    feedback_items = db.query(UserFeedback).filter(
        UserFeedback.user_id == current_user.id
    ).order_by(UserFeedback.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        FeedbackHistoryItem(
            id=f.id,
            scan_id=f.scan_id,
            feedback_type=f.feedback_type.value if f.feedback_type else 'unknown',
            is_correct=f.is_correct,
            correct_label=f.correct_label,
            confidence_rating=f.confidence_rating,
            user_comment=f.user_comment,
            model_prediction=f.model_prediction,
            model_confidence=f.model_confidence,
            scan_type=f.scan_type,
            created_at=f.created_at
        )
        for f in feedback_items
    ]


@router.get("/stats")
async def get_user_feedback_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's feedback statistics."""
    
    total_feedback = db.query(UserFeedback).filter(
        UserFeedback.user_id == current_user.id
    ).count()
    
    used_in_training = db.query(UserFeedback).filter(
        UserFeedback.user_id == current_user.id,
        UserFeedback.used_in_training == True
    ).count()
    
    return {
        'total_feedback': total_feedback,
        'used_in_training': used_in_training,
        'contribution_impact': f"Your feedback has helped improve {used_in_training} model predictions!"
    }
