import razorpay
import hmac
import hashlib
import os
from typing import Optional

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_order(amount: float, currency: str = "INR", receipt: Optional[str] = None) -> dict:
    amount_in_paise = int(amount * 100)
    order_data = {
        "amount": amount_in_paise,
        "currency": currency,
        "receipt": receipt or f"order_{amount_in_paise}",
        "payment_capture": 1
    }
    order = client.order.create(data=order_data)
    return order

def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> bool:
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(generated_signature, razorpay_signature)

def get_payment_details(payment_id: str) -> dict:
    return client.payment.fetch(payment_id)

def get_key_id() -> str:
    return RAZORPAY_KEY_ID
