import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import logging

from app.models.email_campaign import EmailCampaign, EmailSend, EmailType, CampaignStatus, TargetAudience
from app.models.user import User, SubscriptionTier
from app.services.email_service import EmailService, get_base_email_template
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailCampaignService:
    def __init__(self):
        self.email_service = EmailService()
    
    def get_email_template_content(
        self,
        email_type: EmailType,
        headline: str,
        body_content: str,
        cta_text: Optional[str] = None,
        cta_url: Optional[str] = None,
        user_name: str = "there",
        **kwargs
    ) -> str:
        """Generate email content based on type with beautiful templates."""
        
        # Get icon based on email type
        icon_map = {
            EmailType.SCAN_COMPLETE: "&#x2705;",  # Check mark
            EmailType.LOW_CREDITS: "&#x26A0;",  # Warning
            EmailType.WEEKLY_SUMMARY: "&#x1F4CA;",  # Chart
            EmailType.SUBSCRIPTION_EXPIRING: "&#x23F0;",  # Alarm clock
            EmailType.PASSWORD_CHANGED: "&#x1F512;",  # Lock
            EmailType.NEW_FEATURE: "&#x2728;",  # Sparkles
            EmailType.PROMOTIONAL: "&#x1F381;",  # Gift
            EmailType.TIPS_TRICKS: "&#x1F4A1;",  # Light bulb
            EmailType.PRODUCT_UPDATE: "&#x1F680;",  # Rocket
        }
        
        icon = icon_map.get(email_type, "&#x1F4E7;")  # Default: envelope
        
        # Determine if this is a marketing email (different styling)
        is_marketing = email_type in [
            EmailType.NEW_FEATURE, 
            EmailType.PROMOTIONAL, 
            EmailType.TIPS_TRICKS, 
            EmailType.PRODUCT_UPDATE
        ]
        
        # Build CTA button if provided
        cta_html = ""
        if cta_text and cta_url:
            cta_html = f"""
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <a href="{cta_url}" class="button" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 50px; text-align: center;">
                                {cta_text}
                            </a>
                        </td>
                    </tr>
                </table>
            """
        
        # Marketing emails get a special banner
        marketing_banner = ""
        if is_marketing:
            marketing_banner = f"""
                <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px; text-align: center;">
                        <span style="color: #000000; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                            {'NEW FEATURE' if email_type == EmailType.NEW_FEATURE else 'SPECIAL OFFER' if email_type == EmailType.PROMOTIONAL else 'PRO TIP' if email_type == EmailType.TIPS_TRICKS else 'PRODUCT UPDATE'}
                        </span>
                    </td>
                </tr>
            """
        
        content = f"""
        {marketing_banner}
        <tr>
            <td class="content-cell" style="padding: 48px 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <div style="width: 72px; height: 72px; background: {'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))' if is_marketing else 'rgba(16, 185, 129, 0.15)'}; border-radius: 50%; display: inline-block; line-height: 72px; text-align: center; {'border: 2px solid rgba(16, 185, 129, 0.3);' if is_marketing else ''}">
                                <span style="font-size: 32px;">{icon}</span>
                            </div>
                        </td>
                    </tr>
                </table>
                <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 600; color: #ffffff; text-align: center; line-height: 1.3;">
                    {headline}
                </h1>
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #9ca3af; text-align: center; line-height: 1.6;">
                    Hi {user_name},
                </p>
                <div style="margin: 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.7;">
                    {body_content}
                </div>
                {cta_html}
            </td>
        </tr>
        """
        
        return content
    
    # ==================== NOTIFICATION EMAILS ====================
    
    def send_scan_complete_email(
        self, 
        to_email: str, 
        scan_type: str, 
        result_summary: str,
        credits_used: int,
        full_name: Optional[str] = None
    ) -> bool:
        """Send notification when a scan is complete."""
        name = full_name.split()[0] if full_name else "there"
        
        scan_type_display = {
            "ai_detection": "AI Detection",
            "humanize": "Humanization",
            "plagiarism": "Plagiarism Check"
        }.get(scan_type, scan_type.title())
        
        body_content = f"""
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; margin-bottom: 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Scan Type</td>
                                    <td align="right" style="color: #10b981; font-size: 14px; font-weight: 600;">{scan_type_display}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Result</td>
                                    <td align="right" style="color: #ffffff; font-size: 14px; font-weight: 600;">{result_summary}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Credits Used</td>
                                    <td align="right" style="color: #ffffff; font-size: 14px; font-weight: 600;">{credits_used:,} words</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align: center; color: #6b7280; font-size: 13px;">
                View your complete results in your dashboard.
            </p>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.SCAN_COMPLETE,
            headline="Your Scan is Complete!",
            body_content=body_content,
            cta_text="View Results",
            cta_url=f"{settings.FRONTEND_URL}/history",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Your {scan_type_display} scan is complete")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject=f"Scan Complete: {scan_type_display} - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, your {scan_type_display} scan is complete. Result: {result_summary}. Credits used: {credits_used}. View results at {settings.FRONTEND_URL}/history"
        )
    
    def send_low_credits_email(
        self, 
        to_email: str, 
        current_balance: int,
        full_name: Optional[str] = None
    ) -> bool:
        """Send warning when credits are running low."""
        name = full_name.split()[0] if full_name else "there"
        
        body_content = f"""
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 14px;">Current Balance</p>
                <p style="margin: 0; color: #ef4444; font-size: 36px; font-weight: 700;">{current_balance:,}</p>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">words remaining</p>
            </div>
            <p style="text-align: center; color: #d1d5db; font-size: 15px; line-height: 1.6;">
                Your credit balance is running low. Top up now to continue using TextShift without interruption.
            </p>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.LOW_CREDITS,
            headline="Low Credit Warning",
            body_content=body_content,
            cta_text="Buy More Credits",
            cta_url=f"{settings.FRONTEND_URL}/dashboard",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Your TextShift credits are running low ({current_balance:,} remaining)")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject="Low Credit Warning - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, your TextShift credit balance is running low. Current balance: {current_balance:,} words. Top up at {settings.FRONTEND_URL}/dashboard"
        )
    
    def send_weekly_summary_email(
        self, 
        to_email: str, 
        total_scans: int,
        ai_detections: int,
        humanizations: int,
        plagiarism_checks: int,
        credits_used: int,
        credits_remaining: int,
        full_name: Optional[str] = None
    ) -> bool:
        """Send weekly usage summary."""
        name = full_name.split()[0] if full_name else "there"
        
        body_content = f"""
            <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-bottom: 24px;">
                Here's your activity summary for the past week
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Total Scans</td>
                                    <td align="right" style="color: #10b981; font-size: 20px; font-weight: 700;">{total_scans}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">AI Detections</td>
                                    <td align="right" style="color: #ffffff; font-size: 16px; font-weight: 600;">{ai_detections}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Humanizations</td>
                                    <td align="right" style="color: #ffffff; font-size: 16px; font-weight: 600;">{humanizations}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Plagiarism Checks</td>
                                    <td align="right" style="color: #ffffff; font-size: 16px; font-weight: 600;">{plagiarism_checks}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #9ca3af; font-size: 14px;">Credits Used</td>
                                    <td align="right" style="color: #ffffff; font-size: 16px; font-weight: 600;">{credits_used:,} words</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
            <div style="background: rgba(16, 185, 129, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">Current Balance</p>
                <p style="margin: 4px 0 0 0; color: #10b981; font-size: 24px; font-weight: 700;">{'Unlimited' if credits_remaining == -1 else f'{credits_remaining:,}'} words</p>
            </div>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.WEEKLY_SUMMARY,
            headline="Your Weekly Summary",
            body_content=body_content,
            cta_text="View Dashboard",
            cta_url=f"{settings.FRONTEND_URL}/dashboard",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Your TextShift weekly summary: {total_scans} scans this week")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject="Your Weekly Summary - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, here's your weekly summary. Total scans: {total_scans}. Credits used: {credits_used:,}. Balance: {'Unlimited' if credits_remaining == -1 else f'{credits_remaining:,}'} words."
        )
    
    def send_subscription_expiring_email(
        self, 
        to_email: str, 
        plan_name: str,
        days_remaining: int,
        full_name: Optional[str] = None
    ) -> bool:
        """Send reminder when subscription is about to expire."""
        name = full_name.split()[0] if full_name else "there"
        
        body_content = f"""
            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 14px;">Your {plan_name} plan expires in</p>
                <p style="margin: 0; color: #fbbf24; font-size: 48px; font-weight: 700;">{days_remaining}</p>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">days</p>
            </div>
            <p style="text-align: center; color: #d1d5db; font-size: 15px; line-height: 1.6;">
                Renew now to keep your unlimited access and avoid any interruption to your workflow.
            </p>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.SUBSCRIPTION_EXPIRING,
            headline="Subscription Expiring Soon",
            body_content=body_content,
            cta_text="Renew Now",
            cta_url=f"{settings.FRONTEND_URL}/pricing",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Your TextShift {plan_name} plan expires in {days_remaining} days")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject=f"Your {plan_name} Plan Expires in {days_remaining} Days - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, your TextShift {plan_name} plan expires in {days_remaining} days. Renew at {settings.FRONTEND_URL}/pricing"
        )
    
    def send_password_changed_email(
        self, 
        to_email: str, 
        full_name: Optional[str] = None
    ) -> bool:
        """Send security notification when password is changed."""
        name = full_name.split()[0] if full_name else "there"
        
        body_content = f"""
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; color: #10b981; font-size: 16px; font-weight: 600;">
                    Your password has been successfully changed
                </p>
            </div>
            <p style="text-align: center; color: #d1d5db; font-size: 15px; line-height: 1.6;">
                If you didn't make this change, please contact our support team immediately or reset your password.
            </p>
            <p style="text-align: center; color: #6b7280; font-size: 13px; margin-top: 24px;">
                Changed on: {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}
            </p>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.PASSWORD_CHANGED,
            headline="Password Changed",
            body_content=body_content,
            cta_text="Go to Settings",
            cta_url=f"{settings.FRONTEND_URL}/settings",
            user_name=name
        )
        
        html_content = get_base_email_template(content, "Your TextShift password has been changed")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject="Password Changed - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, your TextShift password has been changed. If you didn't make this change, please contact support immediately."
        )
    
    # ==================== MARKETING EMAILS ====================
    
    def send_new_feature_email(
        self, 
        to_email: str, 
        feature_name: str,
        feature_description: str,
        feature_benefits: List[str],
        full_name: Optional[str] = None
    ) -> bool:
        """Send announcement about a new feature."""
        name = full_name.split()[0] if full_name else "there"
        
        benefits_html = "".join([
            f'<li style="color: #d1d5db; font-size: 15px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">'
            f'<span style="color: #10b981; margin-right: 8px;">&#x2713;</span> {benefit}</li>'
            for benefit in feature_benefits
        ])
        
        body_content = f"""
            <p style="text-align: center; color: #d1d5db; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                {feature_description}
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
                    What's New
                </p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    {benefits_html}
                </ul>
            </div>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.NEW_FEATURE,
            headline=f"Introducing: {feature_name}",
            body_content=body_content,
            cta_text="Try It Now",
            cta_url=f"{settings.FRONTEND_URL}/dashboard",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"New Feature: {feature_name} is now available on TextShift")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject=f"New Feature: {feature_name} - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, we're excited to announce {feature_name}! {feature_description}. Try it at {settings.FRONTEND_URL}/dashboard"
        )
    
    def send_promotional_email(
        self, 
        to_email: str, 
        promo_title: str,
        promo_description: str,
        promo_code: Optional[str] = None,
        discount_amount: Optional[str] = None,
        expiry_date: Optional[str] = None,
        full_name: Optional[str] = None
    ) -> bool:
        """Send promotional offer email."""
        name = full_name.split()[0] if full_name else "there"
        
        promo_code_html = ""
        if promo_code:
            promo_code_html = f"""
                <div style="background: rgba(16, 185, 129, 0.15); border: 2px dashed rgba(16, 185, 129, 0.5); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Use Code</p>
                    <p style="margin: 0; color: #10b981; font-size: 28px; font-weight: 700; letter-spacing: 4px;">{promo_code}</p>
                    {f'<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">Expires: {expiry_date}</p>' if expiry_date else ''}
                </div>
            """
        
        discount_html = ""
        if discount_amount:
            discount_html = f"""
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="background: linear-gradient(135deg, #10b981, #059669); color: #000000; font-size: 32px; font-weight: 700; padding: 12px 24px; border-radius: 12px; display: inline-block;">
                        {discount_amount}
                    </span>
                </div>
            """
        
        body_content = f"""
            {discount_html}
            <p style="text-align: center; color: #d1d5db; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                {promo_description}
            </p>
            {promo_code_html}
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.PROMOTIONAL,
            headline=promo_title,
            body_content=body_content,
            cta_text="Claim Offer",
            cta_url=f"{settings.FRONTEND_URL}/pricing",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Special Offer: {promo_title}")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject=f"Special Offer: {promo_title} - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, {promo_title}! {promo_description}. {'Use code: ' + promo_code if promo_code else ''} Claim at {settings.FRONTEND_URL}/pricing"
        )
    
    def send_tips_email(
        self, 
        to_email: str, 
        tip_title: str,
        tips: List[dict],  # [{"title": "...", "description": "..."}]
        full_name: Optional[str] = None
    ) -> bool:
        """Send tips and best practices email."""
        name = full_name.split()[0] if full_name else "there"
        
        tips_html = ""
        for i, tip in enumerate(tips, 1):
            tips_html += f"""
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: flex-start;">
                        <div style="background: linear-gradient(135deg, #10b981, #059669); color: #000000; font-size: 14px; font-weight: 700; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; margin-right: 16px; flex-shrink: 0;">
                            {i}
                        </div>
                        <div>
                            <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">{tip['title']}</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">{tip['description']}</p>
                        </div>
                    </div>
                </div>
            """
        
        body_content = f"""
            <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-bottom: 24px;">
                Get the most out of TextShift with these pro tips
            </p>
            {tips_html}
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.TIPS_TRICKS,
            headline=tip_title,
            body_content=body_content,
            cta_text="Start Using TextShift",
            cta_url=f"{settings.FRONTEND_URL}/dashboard",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Pro Tips: {tip_title}")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject=f"Pro Tips: {tip_title} - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, here are some tips to get the most out of TextShift. {' '.join([t['title'] + ': ' + t['description'] for t in tips])}"
        )
    
    def send_product_update_email(
        self, 
        to_email: str, 
        update_title: str,
        update_description: str,
        updates: List[str],
        full_name: Optional[str] = None
    ) -> bool:
        """Send product update/changelog email."""
        name = full_name.split()[0] if full_name else "there"
        
        updates_html = "".join([
            f'<li style="color: #d1d5db; font-size: 15px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">'
            f'<span style="color: #10b981; margin-right: 8px;">&#x1F680;</span> {update}</li>'
            for update in updates
        ])
        
        body_content = f"""
            <p style="text-align: center; color: #d1d5db; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                {update_description}
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
                    What's Changed
                </p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    {updates_html}
                </ul>
            </div>
        """
        
        content = self.get_email_template_content(
            email_type=EmailType.PRODUCT_UPDATE,
            headline=update_title,
            body_content=body_content,
            cta_text="See What's New",
            cta_url=f"{settings.FRONTEND_URL}/dashboard",
            user_name=name
        )
        
        html_content = get_base_email_template(content, f"Product Update: {update_title}")
        
        return self.email_service.send_email(
            to_email=to_email,
            subject=f"Product Update: {update_title} - TextShift",
            html_content=html_content,
            text_content=f"Hi {name}, we've made some updates to TextShift! {update_description}. Updates: {', '.join(updates)}"
        )
    
    # ==================== CAMPAIGN MANAGEMENT ====================
    
    def get_target_users(self, db: Session, target_audience: TargetAudience, is_marketing: bool = False) -> List[User]:
        """Get users matching the target audience criteria."""
        query = db.query(User).filter(User.is_verified == True)
        
        # Filter by email preferences
        if is_marketing:
            query = query.filter(User.marketing_emails == True)
        else:
            query = query.filter(User.email_notifications == True)
        
        # Filter by audience
        if target_audience == TargetAudience.FREE_TIER:
            query = query.filter(User.subscription_tier == SubscriptionTier.FREE)
        elif target_audience == TargetAudience.STARTER_TIER:
            query = query.filter(User.subscription_tier == SubscriptionTier.STARTER)
        elif target_audience == TargetAudience.PRO_TIER:
            query = query.filter(User.subscription_tier == SubscriptionTier.PRO)
        elif target_audience == TargetAudience.ENTERPRISE_TIER:
            query = query.filter(User.subscription_tier == SubscriptionTier.ENTERPRISE)
        elif target_audience == TargetAudience.ACTIVE_USERS:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(User.last_login >= thirty_days_ago)
        elif target_audience == TargetAudience.INACTIVE_USERS:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(or_(User.last_login < thirty_days_ago, User.last_login == None))
        
        return query.all()
    
    def send_campaign(self, db: Session, campaign: EmailCampaign) -> dict:
        """Send an email campaign to all target users."""
        is_marketing = campaign.email_type in [
            EmailType.NEW_FEATURE, 
            EmailType.PROMOTIONAL, 
            EmailType.TIPS_TRICKS, 
            EmailType.PRODUCT_UPDATE
        ]
        
        users = self.get_target_users(db, campaign.target_audience, is_marketing)
        
        campaign.status = CampaignStatus.SENDING
        campaign.total_recipients = len(users)
        db.commit()
        
        sent_count = 0
        for user in users:
            try:
                # Generate tracking ID
                tracking_id = secrets.token_urlsafe(32)
                
                # Create email send record
                email_send = EmailSend(
                    campaign_id=campaign.id,
                    user_id=user.id,
                    tracking_id=tracking_id
                )
                db.add(email_send)
                
                # Generate email content
                content = self.get_email_template_content(
                    email_type=campaign.email_type,
                    headline=campaign.headline,
                    body_content=campaign.body_content,
                    cta_text=campaign.cta_text,
                    cta_url=campaign.cta_url,
                    user_name=user.full_name.split()[0] if user.full_name else "there"
                )
                
                html_content = get_base_email_template(content, campaign.preview_text or campaign.subject)
                
                # Send email
                success = self.email_service.send_email(
                    to_email=user.email,
                    subject=campaign.subject,
                    html_content=html_content,
                    text_content=f"{campaign.headline}\n\n{campaign.body_content}"
                )
                
                if success:
                    email_send.sent_at = datetime.utcnow()
                    sent_count += 1
                
                db.commit()
                
            except Exception as e:
                logger.error(f"Failed to send campaign email to {user.email}: {e}")
                continue
        
        campaign.emails_sent = sent_count
        campaign.status = CampaignStatus.SENT
        campaign.sent_at = datetime.utcnow()
        db.commit()
        
        return {
            "total_recipients": campaign.total_recipients,
            "emails_sent": sent_count,
            "success_rate": (sent_count / campaign.total_recipients * 100) if campaign.total_recipients > 0 else 0
        }


# Singleton instance
email_campaign_service = EmailCampaignService()
