const axios = require('axios');
const { getSetting } = require('../database/db');
const { logger } = require('../middleware/errorHandler');
const { MESSAGE_TYPES } = require('../config/constants');

class MailgunService {
  constructor() {
    this.apiKey = null;
    this.domain = null;
    this.client = null;
  }

  initialize() {
    this.apiKey = getSetting('mailgun_api_key');
    this.domain = getSetting('mailgun_domain') || 'bytecare.shop';

    if (!this.apiKey) {
      throw new Error('Mailgun API key not configured');
    }

    this.client = axios.create({
      baseURL: `https://api.mailgun.net/v3/${this.domain}`,
      auth: {
        username: 'api',
        password: this.apiKey
      }
    });
  }

  async sendMessage({ channel, recipient, subject, body, invoice }) {
    this.initialize();

    switch (channel) {
      case MESSAGE_TYPES.EMAIL:
        return this.sendEmail({ recipient, subject, body, invoice });
      case MESSAGE_TYPES.SMS:
        return this.sendSMS({ recipient, body, invoice });
      case MESSAGE_TYPES.WHATSAPP:
        return this.sendWhatsApp({ recipient, body, invoice });
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  async sendEmail({ recipient, subject, body, invoice }) {
    try {
      const businessName = getSetting('business_name') || 'ByteCare';
      const businessEmail = getSetting('business_email') || `support@${this.domain}`;
      
      const htmlContent = this.generateEmailHTML(body, invoice, businessName);

      const formData = new URLSearchParams();
      formData.append('from', `${businessName} <${businessEmail}>`);
      formData.append('to', recipient);
      formData.append('subject', subject);
      formData.append('html', htmlContent);
      formData.append('text', body);

      const response = await this.client.post('/messages', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      logger.info('Mailgun email sent:', { recipient, messageId: response.data?.id });

      return {
        success: true,
        mailgun_id: response.data?.id,
        message: 'Email sent successfully'
      };
    } catch (error) {
      logger.error('Mailgun email error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Mailgun API key');
      }
      
      throw new Error(`Failed to send email: ${error.response?.data?.message || error.message}`);
    }
  }

  async sendSMS({ recipient, body, invoice }) {
    logger.warn('SMS sending via Mailgun is not supported. Consider using a dedicated SMS service like Twilio.');
    return {
      success: false,
      message: 'SMS not supported via Mailgun. Please use a dedicated SMS service.'
    };
  }

  async sendWhatsApp({ recipient, body, invoice }) {
    logger.warn('WhatsApp sending via Mailgun is not supported.');
    return {
      success: false,
      message: 'WhatsApp not supported via Mailgun.'
    };
  }

  async sendTestEmail({ email, message }) {
    this.initialize();

    const businessName = getSetting('business_name') || 'ByteCare';

    return this.sendEmail({
      recipient: email,
      subject: `Test Email from ${businessName}`,
      body: message,
      invoice: null
    });
  }

  generateEmailHTML(body, invoice, businessName) {
    const themeColor = getSetting('theme_color') || '#0EA5E9';
    
    let invoiceDetails = '';
    if (invoice) {
      invoiceDetails = `
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Invoice Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Invoice Number:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${invoice.invoice_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Subtotal:</td>
              <td style="padding: 8px 0; text-align: right;">₹${invoice.subtotal?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">GST (${invoice.gst_rate || 18}%):</td>
              <td style="padding: 8px 0; text-align: right;">₹${invoice.gst_amount?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr style="border-top: 2px solid #e2e8f0;">
              <td style="padding: 12px 0; font-weight: 600; font-size: 18px;">Total Amount:</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 18px; color: ${themeColor};">₹${invoice.total_amount?.toFixed(2) || '0.00'}</td>
            </tr>
          </table>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f1f5f9;">
        <div style="background: linear-gradient(135deg, ${themeColor} 0%, #0284c7 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${businessName}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Trusted Repair Partner</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="white-space: pre-line; font-size: 15px; color: #475569;">${body}</div>
          
          ${invoiceDetails}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <a href="https://bytecare.shop" style="display: inline-block; background: ${themeColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Visit ByteCare</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 13px;">
            <p style="margin: 5px 0;">Thank you for choosing ${businessName}!</p>
            <p style="margin: 5px 0;">${getSetting('business_address') || 'Barrackpore, West Bengal'}</p>
            <p style="margin: 5px 0;">${getSetting('business_phone') || '+91 7003888936'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async verifyApiKey() {
    try {
      this.initialize();
      
      const response = await axios.get(`https://api.mailgun.net/v3/domains/${this.domain}`, {
        auth: {
          username: 'api',
          password: this.apiKey
        }
      });
      
      return {
        success: true,
        domain: response.data?.domain?.name,
        state: response.data?.domain?.state
      };
    } catch (error) {
      logger.error('Mailgun verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new MailgunService();
