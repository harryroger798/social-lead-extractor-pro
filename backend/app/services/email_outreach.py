"""Auto email outreach service using SMTP (built-in Python, 100% free)."""
import asyncio
import logging
import re
import smtplib
import ssl
import uuid
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)

# Common SMTP configurations
SMTP_CONFIGS = {
    "gmail": {"host": "smtp.gmail.com", "port": 587, "tls": True},
    "outlook": {"host": "smtp-mail.outlook.com", "port": 587, "tls": True},
    "yahoo": {"host": "smtp.mail.yahoo.com", "port": 587, "tls": True},
    "custom": {"host": "", "port": 587, "tls": True},
}


def _render_template(template: str, variables: dict) -> str:
    """Render a template with variables like {{name}}, {{company}}, {{email}}."""
    result = template
    for key, value in variables.items():
        result = result.replace(f"{{{{{key}}}}}", str(value))
    return result


async def send_email(
    smtp_host: str,
    smtp_port: int,
    smtp_username: str,
    smtp_password: str,
    from_name: str,
    to_email: str,
    subject: str,
    body_html: str,
    use_tls: bool = True,
) -> dict:
    """
    Send a single email via SMTP.
    Uses Python's built-in smtplib — zero external dependencies, 100% free.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{from_name} <{smtp_username}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body_html, "html"))

        def _send():
            if use_tls:
                context = ssl.create_default_context()
                with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
                    server.ehlo()
                    server.starttls(context=context)
                    server.ehlo()
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
                    server.login(smtp_username, smtp_password)
                    server.send_message(msg)

        await asyncio.get_event_loop().run_in_executor(None, _send)

        return {"status": "sent", "to": to_email, "error": None}

    except smtplib.SMTPAuthenticationError:
        return {"status": "failed", "to": to_email, "error": "Authentication failed. Check username/password."}
    except smtplib.SMTPRecipientsRefused:
        return {"status": "failed", "to": to_email, "error": f"Recipient refused: {to_email}"}
    except Exception as e:
        return {"status": "failed", "to": to_email, "error": str(e)}


async def send_bulk_emails(
    smtp_host: str,
    smtp_port: int,
    smtp_username: str,
    smtp_password: str,
    from_name: str,
    recipients: list[dict],
    subject_template: str,
    body_template: str,
    delay_seconds: float = 30.0,
    use_tls: bool = True,
) -> dict:
    """
    Send bulk emails with templates and rate limiting.
    recipients: list of dicts with at minimum 'email' key, plus any template variables.
    Templates use {{variable}} syntax.

    Rate limiting: default 30 seconds between emails to avoid spam detection.
    Gmail limit: 500/day. Outlook: 300/day.
    """
    campaign_id = str(uuid.uuid4())
    results = {
        "campaign_id": campaign_id,
        "total": len(recipients),
        "sent": 0,
        "failed": 0,
        "results": [],
    }

    for i, recipient in enumerate(recipients):
        to_email = recipient.get("email", "")
        if not to_email or "@" not in to_email:
            results["failed"] += 1
            results["results"].append({
                "to": to_email, "status": "skipped", "error": "Invalid email"
            })
            continue

        # Render templates
        variables = {
            "name": recipient.get("name", ""),
            "email": to_email,
            "company": recipient.get("company", ""),
            "phone": recipient.get("phone", ""),
            "platform": recipient.get("platform", ""),
            "website": recipient.get("website", ""),
        }
        subject = _render_template(subject_template, variables)
        body = _render_template(body_template, variables)

        result = await send_email(
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            smtp_username=smtp_username,
            smtp_password=smtp_password,
            from_name=from_name,
            to_email=to_email,
            subject=subject,
            body_html=body,
            use_tls=use_tls,
        )

        results["results"].append(result)
        if result["status"] == "sent":
            results["sent"] += 1
        else:
            results["failed"] += 1

        # Rate limiting
        if i < len(recipients) - 1:
            await asyncio.sleep(delay_seconds)

    return results


def get_default_templates() -> list[dict]:
    """Get built-in email templates."""
    return [
        {
            "id": "intro",
            "name": "Introduction",
            "subject": "Quick intro from {{from_name}}",
            "body": """<html><body>
<p>Hi {{name}},</p>
<p>I came across your profile and wanted to reach out. I think there could be a great opportunity for us to connect.</p>
<p>Would you be open to a quick chat?</p>
<p>Best regards,<br>{{from_name}}</p>
</body></html>""",
        },
        {
            "id": "follow_up",
            "name": "Follow Up",
            "subject": "Following up - {{from_name}}",
            "body": """<html><body>
<p>Hi {{name}},</p>
<p>I wanted to follow up on my previous message. I believe we could benefit from connecting.</p>
<p>Let me know if you have a few minutes to chat this week.</p>
<p>Best,<br>{{from_name}}</p>
</body></html>""",
        },
        {
            "id": "partnership",
            "name": "Partnership Proposal",
            "subject": "Partnership opportunity for {{company}}",
            "body": """<html><body>
<p>Hi {{name}},</p>
<p>I've been following {{company}} and I'm impressed with what you're building.</p>
<p>I'd love to explore potential partnership opportunities that could benefit both our companies.</p>
<p>Would you be available for a brief call next week?</p>
<p>Best regards,<br>{{from_name}}</p>
</body></html>""",
        },
    ]
