"""
Authentication utilities - re-exports from security module for backward compatibility.
"""
from app.core.security import (
    get_current_user,
    get_current_active_user,
    get_current_verified_user,
    get_current_admin_user,
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    oauth2_scheme
)

__all__ = [
    'get_current_user',
    'get_current_active_user',
    'get_current_verified_user',
    'get_current_admin_user',
    'verify_password',
    'get_password_hash',
    'create_access_token',
    'decode_token',
    'oauth2_scheme'
]
