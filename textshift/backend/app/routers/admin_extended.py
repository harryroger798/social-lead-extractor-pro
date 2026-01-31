"""
Extended Admin API endpoints for comprehensive dashboard management.
Includes user management, scan analytics, system settings, and more.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, SubscriptionTier
from app.models.scan import Scan, ScanType, ScanStatus
from app.models.feedback import UserFeedback

router = APIRouter(prefix="/api/admin", tags=["admin-extended"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin access."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ============== User Management ==============

class UserListResponse(BaseModel):
    users: List[Dict[str, Any]]
    total: int
    page: int
    per_page: int
    total_pages: int


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    subscription_tier: Optional[str] = None
    credits_balance: Optional[int] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    is_verified: Optional[bool] = None


@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    tier: Optional[str] = None,
    is_active: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all users with filtering and pagination."""
    
    query = db.query(User)
    
    # Apply filters
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) | 
            (User.full_name.ilike(f"%{search}%"))
        )
    
    if tier:
        try:
            tier_enum = SubscriptionTier(tier)
            query = query.filter(User.subscription_tier == tier_enum)
        except ValueError:
            pass
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(User, sort_by, User.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)
    
    # Apply pagination
    offset = (page - 1) * per_page
    users = query.offset(offset).limit(per_page).all()
    
    # Format response
    user_list = []
    for user in users:
        user_list.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_tier": user.subscription_tier.value if user.subscription_tier else "free",
            "credits_balance": user.credits_balance,
            "credits_used_total": user.credits_used_total,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
            "scan_count": db.query(Scan).filter(Scan.user_id == user.id).count()
        })
    
    total_pages = (total + per_page - 1) // per_page
    
    return UserListResponse(
        users=user_list,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get detailed information about a specific user."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's scan statistics
    scan_stats = db.query(
        Scan.scan_type,
        func.count(Scan.id).label('count')
    ).filter(Scan.user_id == user_id).group_by(Scan.scan_type).all()
    
    # Get recent scans
    recent_scans = db.query(Scan).filter(
        Scan.user_id == user_id
    ).order_by(desc(Scan.created_at)).limit(10).all()
    
    # Get feedback count
    feedback_count = db.query(UserFeedback).filter(
        UserFeedback.user_id == user_id
    ).count()
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "subscription_tier": user.subscription_tier.value if user.subscription_tier else "free",
        "subscription_id": user.subscription_id,
        "subscription_expires_at": user.subscription_expires_at.isoformat() if user.subscription_expires_at else None,
        "credits_balance": user.credits_balance,
        "credits_used_total": user.credits_used_total,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "scan_stats": {stat.scan_type.value: stat.count for stat in scan_stats},
        "total_scans": sum(stat.count for stat in scan_stats),
        "feedback_count": feedback_count,
        "recent_scans": [
            {
                "id": scan.id,
                "scan_type": scan.scan_type.value,
                "status": scan.status.value,
                "credits_used": scan.credits_used,
                "created_at": scan.created_at.isoformat() if scan.created_at else None
            }
            for scan in recent_scans
        ]
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update user details (admin only)."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from demoting themselves
    if user.id == admin.id and request.is_admin is False:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin privileges")
    
    # Update fields
    if request.full_name is not None:
        user.full_name = request.full_name
    
    if request.subscription_tier is not None:
        try:
            user.subscription_tier = SubscriptionTier(request.subscription_tier)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    if request.credits_balance is not None:
        user.credits_balance = request.credits_balance
    
    if request.is_active is not None:
        user.is_active = request.is_active
    
    if request.is_admin is not None:
        user.is_admin = request.is_admin
    
    if request.is_verified is not None:
        user.is_verified = request.is_verified
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_tier": user.subscription_tier.value,
            "credits_balance": user.credits_balance,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified
        }
    }


@router.post("/users/{user_id}/add-credits")
async def add_user_credits(
    user_id: int,
    amount: int = Query(..., ge=1),
    reason: str = Query("Admin credit adjustment"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Add credits to a user's account."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Handle unlimited credits case
    if user.credits_balance == -1:
        return {
            "message": "User has unlimited credits",
            "credits_balance": -1
        }
    
    user.credits_balance += amount
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "message": f"Added {amount} credits to user",
        "credits_balance": user.credits_balance,
        "reason": reason
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Soft delete a user (deactivate)."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "User deactivated successfully"}


# ============== Scan Analytics ==============

@router.get("/analytics/overview")
async def get_analytics_overview(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get overall platform analytics."""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total users
    total_users = db.query(User).count()
    new_users = db.query(User).filter(User.created_at >= start_date).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Users by tier
    users_by_tier = db.query(
        User.subscription_tier,
        func.count(User.id).label('count')
    ).group_by(User.subscription_tier).all()
    
    # Total scans
    total_scans = db.query(Scan).count()
    recent_scans = db.query(Scan).filter(Scan.created_at >= start_date).count()
    
    # Scans by type
    scans_by_type = db.query(
        Scan.scan_type,
        func.count(Scan.id).label('count')
    ).filter(Scan.created_at >= start_date).group_by(Scan.scan_type).all()
    
    # Scans by status
    scans_by_status = db.query(
        Scan.status,
        func.count(Scan.id).label('count')
    ).filter(Scan.created_at >= start_date).group_by(Scan.status).all()
    
    # Credits used
    total_credits_used = db.query(func.sum(Scan.credits_used)).filter(
        Scan.created_at >= start_date
    ).scalar() or 0
    
    # Daily scan counts for chart
    daily_scans = db.query(
        func.date(Scan.created_at).label('date'),
        func.count(Scan.id).label('count')
    ).filter(
        Scan.created_at >= start_date
    ).group_by(func.date(Scan.created_at)).order_by('date').all()
    
    # Feedback stats
    total_feedback = db.query(UserFeedback).filter(
        UserFeedback.created_at >= start_date
    ).count()
    
    return {
        "period_days": days,
        "users": {
            "total": total_users,
            "new": new_users,
            "active": active_users,
            "by_tier": {tier.subscription_tier.value if tier.subscription_tier else "free": tier.count for tier in users_by_tier}
        },
        "scans": {
            "total": total_scans,
            "recent": recent_scans,
            "by_type": {scan.scan_type.value: scan.count for scan in scans_by_type},
            "by_status": {scan.status.value: scan.count for scan in scans_by_status},
            "daily": [{"date": str(d.date), "count": d.count} for d in daily_scans]
        },
        "credits": {
            "total_used": total_credits_used
        },
        "feedback": {
            "total": total_feedback
        }
    }


@router.get("/analytics/scans")
async def get_scan_analytics(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scan_type: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get detailed scan analytics with filtering."""
    
    query = db.query(Scan)
    
    # Apply filters
    if scan_type:
        try:
            query = query.filter(Scan.scan_type == ScanType(scan_type))
        except ValueError:
            pass
    
    if status:
        try:
            query = query.filter(Scan.status == ScanStatus(status))
        except ValueError:
            pass
    
    if user_id:
        query = query.filter(Scan.user_id == user_id)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(Scan.created_at >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(Scan.created_at <= end)
        except ValueError:
            pass
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    scans = query.order_by(desc(Scan.created_at)).offset(offset).limit(per_page).all()
    
    # Format response
    scan_list = []
    for scan in scans:
        user = db.query(User).filter(User.id == scan.user_id).first()
        scan_list.append({
            "id": scan.id,
            "user_id": scan.user_id,
            "user_email": user.email if user else "Unknown",
            "scan_type": scan.scan_type.value,
            "status": scan.status.value,
            "input_length": scan.input_length,
            "credits_used": scan.credits_used,
            "ai_probability": scan.ai_probability,
            "plagiarism_score": scan.plagiarism_score,
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None
        })
    
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "scans": scan_list,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


# ============== Feedback Management ==============

@router.get("/feedback/list")
async def list_feedback(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scan_type: Optional[str] = None,
    feedback_type: Optional[str] = None,
    used_in_training: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all feedback with filtering."""
    
    query = db.query(UserFeedback)
    
    if scan_type:
        query = query.filter(UserFeedback.scan_type == scan_type)
    
    if feedback_type:
        query = query.filter(UserFeedback.feedback_type == feedback_type)
    
    if used_in_training is not None:
        query = query.filter(UserFeedback.used_in_training == used_in_training)
    
    total = query.count()
    
    offset = (page - 1) * per_page
    feedback_items = query.order_by(desc(UserFeedback.created_at)).offset(offset).limit(per_page).all()
    
    feedback_list = []
    for fb in feedback_items:
        user = db.query(User).filter(User.id == fb.user_id).first()
        feedback_list.append({
            "id": fb.id,
            "scan_id": fb.scan_id,
            "user_id": fb.user_id,
            "user_email": user.email if user else "Unknown",
            "feedback_type": fb.feedback_type,
            "is_correct": fb.is_correct,
            "correct_label": fb.correct_label,
            "confidence_rating": fb.confidence_rating,
            "model_prediction": fb.model_prediction,
            "model_confidence": fb.model_confidence,
            "scan_type": fb.scan_type,
            "user_comment": fb.user_comment,
            "used_in_training": fb.used_in_training,
            "training_run_id": fb.training_run_id,
            "created_at": fb.created_at.isoformat() if fb.created_at else None
        })
    
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "feedback": feedback_list,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


@router.delete("/feedback/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete a feedback entry."""
    
    feedback = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db.delete(feedback)
    db.commit()
    
    return {"message": "Feedback deleted successfully"}


# ============== System Settings ==============

# In-memory settings (in production, store in database)
SYSTEM_SETTINGS = {
    "rate_limits": {
        "feedback_per_hour": 10,
        "scans_per_minute": 5
    },
    "training": {
        "min_samples": 100,
        "auto_training_enabled": True,
        "training_day": "sunday",
        "training_hour": 3
    },
    "ab_testing": {
        "test_percentage": 20,
        "min_test_duration_days": 7,
        "auto_rollback_threshold": 0.05
    },
    "credits": {
        "free_tier_monthly": 5000,
        "ai_detection_cost": 1,
        "humanize_cost": 2,
        "plagiarism_cost": 1.5
    }
}


@router.get("/settings")
async def get_system_settings(
    admin: User = Depends(require_admin)
):
    """Get current system settings."""
    return SYSTEM_SETTINGS


@router.put("/settings")
async def update_system_settings(
    settings: Dict[str, Any],
    admin: User = Depends(require_admin)
):
    """Update system settings."""
    
    # Update settings (merge with existing)
    for key, value in settings.items():
        if key in SYSTEM_SETTINGS:
            if isinstance(SYSTEM_SETTINGS[key], dict) and isinstance(value, dict):
                SYSTEM_SETTINGS[key].update(value)
            else:
                SYSTEM_SETTINGS[key] = value
    
    return {
        "message": "Settings updated successfully",
        "settings": SYSTEM_SETTINGS
    }


# ============== Export Data ==============

@router.get("/export/users")
async def export_users(
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Export all users data."""
    
    users = db.query(User).all()
    
    user_data = []
    for user in users:
        user_data.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_tier": user.subscription_tier.value if user.subscription_tier else "free",
            "credits_balance": user.credits_balance,
            "credits_used_total": user.credits_used_total,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None
        })
    
    if format == "csv":
        import csv
        import io
        
        output = io.StringIO()
        if user_data:
            writer = csv.DictWriter(output, fieldnames=user_data[0].keys())
            writer.writeheader()
            writer.writerows(user_data)
        
        return {
            "format": "csv",
            "data": output.getvalue(),
            "filename": f"users_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    
    return {
        "format": "json",
        "data": user_data,
        "count": len(user_data),
        "exported_at": datetime.utcnow().isoformat()
    }


@router.get("/export/scans")
async def export_scans(
    format: str = Query("json", regex="^(json|csv)$"),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Export scans data."""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    scans = db.query(Scan).filter(Scan.created_at >= start_date).all()
    
    scan_data = []
    for scan in scans:
        scan_data.append({
            "id": scan.id,
            "user_id": scan.user_id,
            "scan_type": scan.scan_type.value,
            "status": scan.status.value,
            "input_length": scan.input_length,
            "credits_used": scan.credits_used,
            "ai_probability": scan.ai_probability,
            "plagiarism_score": scan.plagiarism_score,
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None
        })
    
    if format == "csv":
        import csv
        import io
        
        output = io.StringIO()
        if scan_data:
            writer = csv.DictWriter(output, fieldnames=scan_data[0].keys())
            writer.writeheader()
            writer.writerows(scan_data)
        
        return {
            "format": "csv",
            "data": output.getvalue(),
            "filename": f"scans_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    
    return {
        "format": "json",
        "data": scan_data,
        "count": len(scan_data),
        "period_days": days,
        "exported_at": datetime.utcnow().isoformat()
    }


# ============== Dashboard Summary ==============

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get comprehensive dashboard summary for admin."""
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    
    # User stats
    total_users = db.query(User).count()
    users_today = db.query(User).filter(User.created_at >= today_start).count()
    users_this_week = db.query(User).filter(User.created_at >= week_start).count()
    users_this_month = db.query(User).filter(User.created_at >= month_start).count()
    
    # Scan stats
    total_scans = db.query(Scan).count()
    scans_today = db.query(Scan).filter(Scan.created_at >= today_start).count()
    scans_this_week = db.query(Scan).filter(Scan.created_at >= week_start).count()
    scans_this_month = db.query(Scan).filter(Scan.created_at >= month_start).count()
    
    # Credits stats
    credits_today = db.query(func.sum(Scan.credits_used)).filter(
        Scan.created_at >= today_start
    ).scalar() or 0
    credits_this_week = db.query(func.sum(Scan.credits_used)).filter(
        Scan.created_at >= week_start
    ).scalar() or 0
    credits_this_month = db.query(func.sum(Scan.credits_used)).filter(
        Scan.created_at >= month_start
    ).scalar() or 0
    
    # Feedback stats
    feedback_today = db.query(UserFeedback).filter(
        UserFeedback.created_at >= today_start
    ).count()
    feedback_this_week = db.query(UserFeedback).filter(
        UserFeedback.created_at >= week_start
    ).count()
    
    # Top users by usage
    top_users = db.query(
        User.id,
        User.email,
        User.full_name,
        func.count(Scan.id).label('scan_count')
    ).join(Scan, User.id == Scan.user_id).filter(
        Scan.created_at >= month_start
    ).group_by(User.id).order_by(desc('scan_count')).limit(5).all()
    
    # Recent activity
    recent_scans = db.query(Scan).order_by(desc(Scan.created_at)).limit(5).all()
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    
    return {
        "users": {
            "total": total_users,
            "today": users_today,
            "this_week": users_this_week,
            "this_month": users_this_month
        },
        "scans": {
            "total": total_scans,
            "today": scans_today,
            "this_week": scans_this_week,
            "this_month": scans_this_month
        },
        "credits": {
            "today": credits_today,
            "this_week": credits_this_week,
            "this_month": credits_this_month
        },
        "feedback": {
            "today": feedback_today,
            "this_week": feedback_this_week
        },
        "top_users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "scan_count": u.scan_count
            }
            for u in top_users
        ],
        "recent_activity": {
            "scans": [
                {
                    "id": s.id,
                    "scan_type": s.scan_type.value,
                    "status": s.status.value,
                    "created_at": s.created_at.isoformat() if s.created_at else None
                }
                for s in recent_scans
            ],
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "created_at": u.created_at.isoformat() if u.created_at else None
                }
                for u in recent_users
            ]
        },
        "generated_at": now.isoformat()
    }
