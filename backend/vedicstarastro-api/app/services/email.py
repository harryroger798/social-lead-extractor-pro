import requests
import os
from typing import Optional

MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY", "")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN", "vedicstarastro.com")
MAILGUN_API_URL = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"

def send_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: Optional[str] = None,
    html_body: Optional[str] = None
) -> dict:
    if from_email is None:
        from_email = f"VedicStarAstro <noreply@{MAILGUN_DOMAIN}>"
    
    data = {
        "from": from_email,
        "to": to_email,
        "subject": subject,
        "text": body
    }
    
    if html_body:
        data["html"] = html_body
    
    try:
        response = requests.post(
            MAILGUN_API_URL,
            auth=("api", MAILGUN_API_KEY),
            data=data
        )
        return {"success": response.status_code == 200, "response": response.json() if response.status_code == 200 else response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

def send_consultation_confirmation(
    to_email: str,
    user_name: str,
    consultation_type: str,
    scheduled_date: str,
    astrologer_name: str,
    amount: float
) -> dict:
    subject = "Consultation Booking Confirmed - VedicStarAstro"
    body = f"""
Dear {user_name},

Your consultation has been successfully booked!

Consultation Details:
- Type: {consultation_type}
- Date & Time: {scheduled_date}
- Astrologer: {astrologer_name}
- Amount Paid: ₹{amount}

You will receive a reminder email 24 hours before your scheduled consultation.

If you have any questions, please contact us at support@vedicstarastro.com

Best regards,
VedicStarAstro Team
"""
    
    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Consultation Booking Confirmed</h2>
        <p>Dear {user_name},</p>
        <p>Your consultation has been successfully booked!</p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Consultation Details</h3>
            <p><strong>Type:</strong> {consultation_type}</p>
            <p><strong>Date & Time:</strong> {scheduled_date}</p>
            <p><strong>Astrologer:</strong> {astrologer_name}</p>
            <p><strong>Amount Paid:</strong> ₹{amount}</p>
        </div>
        
        <p>You will receive a reminder email 24 hours before your scheduled consultation.</p>
        <p>If you have any questions, please contact us at <a href="mailto:support@vedicstarastro.com">support@vedicstarastro.com</a></p>
        
        <p>Best regards,<br><strong>VedicStarAstro Team</strong></p>
    </div>
</body>
</html>
"""
    
    return send_email(to_email, subject, body, html_body=html_body)

def send_contact_form_notification(
    name: str,
    email: str,
    phone: str,
    subject: str,
    message: str
) -> dict:
    admin_email = "contact@vedicstarastro.com"
    email_subject = f"New Contact Form Submission: {subject}"
    body = f"""
New contact form submission received:

Name: {name}
Email: {email}
Phone: {phone or 'Not provided'}
Subject: {subject}

Message:
{message}
"""
    return send_email(admin_email, email_subject, body)
