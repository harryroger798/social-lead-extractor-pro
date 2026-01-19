const axios = require('axios');
const { getSetting } = require('../database/db');
const { logger } = require('../middleware/errorHandler');
const { MESSAGE_TYPES, OMNISEND_RATE_LIMIT } = require('../config/constants');

const OMNISEND_API_URL = 'https://api.omnisend.com/v3';

class OmnisendService {
  constructor() {
    this.apiKey = null;
    this.client = null;
    this.lastRequestTime = 0;
  }

  initialize() {
    this.apiKey = getSetting('omnisend_api_key');

    if (!this.apiKey) {
      throw new Error('Omnisend API key not configured');
    }

    this.client = axios.create({
      baseURL: OMNISEND_API_URL,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / OMNISEND_RATE_LIMIT;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  async sendMessage({ channel, recipient, subject, body, invoice }) {
    this.initialize();
    await this.rateLimit();

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
      const contactId = await this.ensureContact(recipient, 'email');

      const businessName = getSetting('business_name') || 'ByteCare';

      const eventData = {
        systemName: 'bytecare',
        eventName: invoice ? 'invoice_sent' : 'notification_sent',
        eventID: `email_${Date.now()}`,
        origin: 'api',
        eventVersion: 'v1',
        email: recipient,
        properties: {
          subject: subject,
          message: body,
          businessName: businessName,
          sentAt: new Date().toISOString()
        }
      };

      if (invoice) {
        eventData.properties.invoiceNumber = invoice.invoice_number || '';
        eventData.properties.subtotal = invoice.subtotal?.toString() || '0';
        eventData.properties.gstAmount = invoice.gst_amount?.toString() || '0';
        eventData.properties.totalAmount = invoice.total_amount?.toString() || '0';
        eventData.properties.customerName = invoice.customer_name || '';
      }

      const response = await this.client.post('/events', eventData);

      logger.info('Omnisend event sent:', { eventName: eventData.eventName, recipient });

      return {
        success: true,
        omnisend_id: response.data?.eventID || eventData.eventID,
        message: 'Email event triggered successfully. Set up an automation in Omnisend to send emails for this event.'
      };
    } catch (error) {
      logger.error('Omnisend email error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Omnisend API key');
      }
      
      throw new Error(`Failed to send email: ${error.response?.data?.error || error.message}`);
    }
  }

  async sendSMS({ recipient, body, invoice }) {
    try {
      const contactId = await this.ensureContact(recipient, 'phone');

      const businessName = getSetting('business_name') || 'ByteCare';

      const eventData = {
        systemName: 'bytecare',
        eventName: invoice ? 'invoice_sms_sent' : 'sms_notification_sent',
        eventID: `sms_${Date.now()}`,
        origin: 'api',
        eventVersion: 'v1',
        phone: recipient,
        properties: {
          message: body,
          businessName: businessName,
          sentAt: new Date().toISOString()
        }
      };

      if (invoice) {
        eventData.properties.invoiceNumber = invoice.invoice_number || '';
        eventData.properties.totalAmount = invoice.total_amount?.toString() || '0';
        eventData.properties.customerName = invoice.customer_name || '';
      }

      const response = await this.client.post('/events', eventData);

      logger.info('Omnisend SMS event sent:', { eventName: eventData.eventName, recipient });

      return {
        success: true,
        omnisend_id: response.data?.eventID || eventData.eventID,
        message: 'SMS event triggered successfully. Set up an automation in Omnisend to send SMS for this event.'
      };
    } catch (error) {
      logger.error('Omnisend SMS error:', error.response?.data || error.message);
      throw new Error(`Failed to send SMS: ${error.response?.data?.error || error.message}`);
    }
  }

  async sendWhatsApp({ recipient, body, invoice }) {
    logger.warn('WhatsApp sending via Omnisend is not directly supported, falling back to SMS');
    return this.sendSMS({ recipient, body, invoice });
  }

  async ensureContact(identifier, type) {
    try {
      let searchResponse;
      
      if (type === 'email') {
        searchResponse = await this.client.get('/contacts', {
          params: { email: identifier }
        });
      } else {
        searchResponse = await this.client.get('/contacts', {
          params: { phone: identifier }
        });
      }

      if (searchResponse.data?.contacts?.length > 0) {
        return searchResponse.data.contacts[0].contactID;
      }

      const contactData = {
        identifiers: []
      };

      if (type === 'email') {
        contactData.identifiers.push({
          type: 'email',
          id: identifier,
          channels: {
            email: {
              status: 'subscribed',
              statusDate: new Date().toISOString()
            }
          }
        });
      } else {
        contactData.identifiers.push({
          type: 'phone',
          id: identifier,
          channels: {
            sms: {
              status: 'subscribed',
              statusDate: new Date().toISOString()
            }
          }
        });
      }

      const createResponse = await this.client.post('/contacts', contactData);
      return createResponse.data?.contactID;
    } catch (error) {
      logger.error('Error ensuring contact:', error.response?.data || error.message);
      throw new Error(`Failed to create/find contact: ${error.message}`);
    }
  }

  async sendTestEmail({ email, message }) {
    this.initialize();
    await this.rateLimit();

    const businessName = getSetting('business_name') || 'ByteCare';

    return this.sendEmail({
      recipient: email,
      subject: `Test Email from ${businessName}`,
      body: message,
      invoice: null
    });
  }

  generateEmailHTML(body, invoice, businessName) {
    const themeColor = getSetting('theme_color') || '#2563eb';
    
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${themeColor}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${businessName}</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="white-space: pre-line;">${body}</div>
          
          ${invoiceDetails}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Thank you for choosing ${businessName}!</p>
            <p style="margin: 5px 0;">${getSetting('business_address') || ''}</p>
            <p style="margin: 5px 0;">${getSetting('business_phone') || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async getStats() {
    this.initialize();
    await this.rateLimit();

    try {
      const response = await this.client.get('/campaigns', {
        params: {
          limit: 100,
          sort: '-createdAt'
        }
      });

      return {
        success: true,
        campaigns: response.data?.campaigns || [],
        total: response.data?.campaigns?.length || 0
      };
    } catch (error) {
      logger.error('Error fetching Omnisend stats:', error.message);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }
}

module.exports = new OmnisendService();
