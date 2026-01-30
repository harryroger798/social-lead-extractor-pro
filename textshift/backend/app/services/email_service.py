import httpx
import secrets
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings


class EmailService:
    def __init__(self):
        self.api_key = settings.MAILGUN_API_KEY
        self.domain = settings.MAILGUN_DOMAIN
        self.from_email = f"{settings.MAILGUN_FROM_NAME} <{settings.MAILGUN_FROM_EMAIL}>"
        self.base_url = f"https://api.mailgun.net/v3/{self.domain}"
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/messages",
                    auth=("api", self.api_key),
                    data={
                        "from": self.from_email,
                        "to": to_email,
                        "subject": subject,
                        "html": html_content,
                        "text": text_content or html_content
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False
    
    def send_verification_email(self, to_email: str, token: str) -> bool:
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TextShift</h1>
                </div>
                <div class="content">
                    <h2>Verify Your Email Address</h2>
                    <p>Thank you for signing up for TextShift! Please click the button below to verify your email address:</p>
                    <p style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #10b981;">{verification_url}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account with TextShift, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 TextShift. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Verify Your Email Address
        
        Thank you for signing up for TextShift! Please click the link below to verify your email address:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with TextShift, you can safely ignore this email.
        
        © 2026 TextShift. All rights reserved.
        """
        
        return self.send_email(
            to_email=to_email,
            subject="Verify Your Email - TextShift",
            html_content=html_content,
            text_content=text_content
        )
    
    def send_password_reset_email(self, to_email: str, token: str) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TextShift</h1>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #10b981;">{reset_url}</p>
                    <div class="warning">
                        <strong>Important:</strong> This link will expire in 30 minutes for security reasons.
                    </div>
                    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 TextShift. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Reset Your Password
        
        We received a request to reset your password. Click the link below to create a new password:
        
        {reset_url}
        
        Important: This link will expire in 30 minutes for security reasons.
        
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        
        © 2026 TextShift. All rights reserved.
        """
        
        return self.send_email(
            to_email=to_email,
            subject="Reset Your Password - TextShift",
            html_content=html_content,
            text_content=text_content
        )
    
    def send_welcome_email(self, to_email: str, full_name: Optional[str] = None) -> bool:
        name = full_name or "there"
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .header h1 {{ color: white; margin: 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .feature {{ background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #10b981; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to TextShift!</h1>
                </div>
                <div class="content">
                    <h2>Hi {name}!</h2>
                    <p>Welcome to TextShift - your all-in-one AI content platform. We're excited to have you on board!</p>
                    
                    <h3>What you can do with TextShift:</h3>
                    <div class="feature">
                        <strong>AI Detection</strong> - Detect AI-generated content with 99.18% accuracy
                    </div>
                    <div class="feature">
                        <strong>Humanizer</strong> - Transform AI text to bypass detection tools
                    </div>
                    <div class="feature">
                        <strong>Plagiarism Checker</strong> - Check content originality with 99.95% accuracy
                    </div>
                    
                    <p>You've received <strong>20,000 free credits</strong> to get started!</p>
                    
                    <p style="text-align: center;">
                        <a href="{dashboard_url}" class="button">Go to Dashboard</a>
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 TextShift. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to TextShift!
        
        Hi {name}!
        
        Welcome to TextShift - your all-in-one AI content platform. We're excited to have you on board!
        
        What you can do with TextShift:
        - AI Detection - Detect AI-generated content with 99.18% accuracy
        - Humanizer - Transform AI text to bypass detection tools
        - Plagiarism Checker - Check content originality with 99.95% accuracy
        
        You've received 20,000 free credits to get started!
        
        Go to your dashboard: {dashboard_url}
        
        © 2026 TextShift. All rights reserved.
        """
        
        return self.send_email(
            to_email=to_email,
            subject="Welcome to TextShift!",
            html_content=html_content,
            text_content=text_content
        )


def generate_token() -> str:
    return secrets.token_urlsafe(32)


email_service = EmailService()
