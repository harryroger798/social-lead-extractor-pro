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
    this.domain = getSetting('mailgun_domain') || 'mail.bytecare.shop';

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

  async sendEmail({ recipient, subject, body, invoice, template, data }) {
    try {
      this.initialize();
      const businessName = getSetting('business_name') || 'ByteCare';
      const businessEmail = getSetting('business_email') || `support@${this.domain}`;
      
      let htmlContent;
      if (template && data) {
        htmlContent = this.generateTemplateEmail(template, data, businessName);
      } else {
        htmlContent = this.generateEmailHTML(body, invoice, businessName);
      }

      const formData = new URLSearchParams();
      formData.append('from', `${businessName} <${businessEmail}>`);
      formData.append('to', recipient);
      formData.append('subject', subject);
      formData.append('html', htmlContent);
      formData.append('text', body || this.stripHtml(htmlContent));

      const response = await this.client.post('/messages', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      logger.info('Mailgun email sent:', { recipient, subject, messageId: response.data?.id });

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

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async sendSMS({ recipient, body, invoice }) {
    logger.warn('SMS sending via Mailgun is not supported.');
    return { success: false, message: 'SMS not supported via Mailgun.' };
  }

  async sendWhatsApp({ recipient, body, invoice }) {
    logger.warn('WhatsApp sending via Mailgun is not supported.');
    return { success: false, message: 'WhatsApp not supported via Mailgun.' };
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

  // ==================== REPAIR EMAIL METHODS ====================

  async sendRepairCreatedEmail({ customer, repair }) {
    const businessName = getSetting('business_name') || 'ByteCare';
    return this.sendEmail({
      recipient: customer.email,
      subject: `Repair Ticket Created - ${repair.invoice_number} | ${businessName}`,
      template: 'repair_created',
      data: { customer, repair }
    });
  }

  async sendRepairStatusUpdateEmail({ customer, repair, oldStatus, newStatus }) {
    const businessName = getSetting('business_name') || 'ByteCare';
    const statusMessages = {
      'pending': 'Your repair is in queue and will be started soon.',
      'in_progress': 'Great news! Our technician has started working on your device.',
      'waiting_for_parts': 'We are waiting for parts to arrive.',
      'completed': 'Your repair is complete and ready for pickup!',
      'delivered': 'Your device has been delivered. Thank you!',
      'cancelled': 'Your repair has been cancelled.'
    };
    return this.sendEmail({
      recipient: customer.email,
      subject: `Repair Update: ${newStatus.replace(/_/g, ' ').toUpperCase()} - ${repair.invoice_number}`,
      template: 'repair_status_update',
      data: { customer, repair, oldStatus, newStatus, statusMessage: statusMessages[newStatus] || 'Status updated.' }
    });
  }

  async sendRepairCompletedEmail({ customer, repair, invoice }) {
    const businessName = getSetting('business_name') || 'ByteCare';
    return this.sendEmail({
      recipient: customer.email,
      subject: `Repair Complete - Ready for Pickup! | ${businessName}`,
      template: 'repair_completed',
      data: { customer, repair, invoice }
    });
  }

  async sendInvoiceEmail({ customer, invoice, repair }) {
    const businessName = getSetting('business_name') || 'ByteCare';
    return this.sendEmail({
      recipient: customer.email,
      subject: `Invoice ${invoice.invoice_number} from ${businessName}`,
      template: 'invoice',
      data: { customer, invoice, repair }
    });
  }

  async sendPaymentReceivedEmail({ customer, invoice }) {
    const businessName = getSetting('business_name') || 'ByteCare';
    return this.sendEmail({
      recipient: customer.email,
      subject: `Payment Received - Thank You! | ${businessName}`,
      template: 'payment_received',
      data: { customer, invoice }
    });
  }

  // ==================== TEMPLATE GENERATOR ====================

  generateTemplateEmail(template, data, businessName) {
    const themeColor = getSetting('theme_color') || '#0EA5E9';
    const businessPhone = getSetting('business_phone') || '+91 7003888936';
    const businessAddress = getSetting('business_address') || 'Barrackpore, West Bengal';

    const templates = {
      repair_created: this.repairCreatedTemplate(data, themeColor),
      repair_status_update: this.repairStatusUpdateTemplate(data, themeColor),
      repair_completed: this.repairCompletedTemplate(data, themeColor),
      invoice: this.invoiceTemplate(data, themeColor),
      payment_received: this.paymentReceivedTemplate(data, themeColor)
    };

    const content = templates[template] || '<p>Email content</p>';
    return this.wrapInEmailLayout(content, businessName, themeColor, businessPhone, businessAddress);
  }

  wrapInEmailLayout(content, businessName, themeColor, businessPhone, businessAddress) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, ${themeColor} 0%, #0369a1 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">${businessName}</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Trusted Repair Partner</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">Need help? We're here for you!</p>
              <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${businessPhone}</p>
              <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 13px;">${businessAddress}</p>
              <a href="https://bytecare.shop" style="color: ${themeColor}; text-decoration: none; font-size: 13px;">Visit our website</a>
              <p style="margin: 20px 0 0 0; color: #64748b; font-size: 11px;">&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  repairCreatedTemplate(data, themeColor) {
    const { customer, repair } = data;
    const estimatedDate = repair.estimated_completion 
      ? new Date(repair.estimated_completion).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'To be determined';

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 70px; height: 70px; border-radius: 50%; line-height: 70px; margin-bottom: 15px;">
          <span style="color: white; font-size: 32px;">&#10003;</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">Repair Ticket Created!</h2>
        <p style="margin: 10px 0 0 0; color: #64748b; font-size: 15px;">We've received your device and created a repair ticket.</p>
      </div>
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Ticket Number</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: ${themeColor}; font-weight: 700; font-size: 16px;">${repair.invoice_number}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Device</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${repair.brand || ''} ${repair.model || ''} (${repair.device_type})</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Issue</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${(repair.issue_description || '').substring(0, 50)}${(repair.issue_description || '').length > 50 ? '...' : ''}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Status</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;"><span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PENDING</span></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Estimated Completion</td>
            <td style="padding: 12px 0; text-align: right; color: #1e293b; font-weight: 500;">${estimatedDate}</td>
          </tr>
        </table>
      </div>
      <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid ${themeColor};">
        <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>Track your repair online!</strong><br>Visit <a href="https://bytecare.shop/track" style="color: ${themeColor}; font-weight: 600;">bytecare.shop/track</a> and enter your phone number.</p>
      </div>
      <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">Hi <strong>${customer.name}</strong>, thank you for trusting us with your device!</p>`;
  }

  repairStatusUpdateTemplate(data, themeColor) {
    const { customer, repair, oldStatus, newStatus, statusMessage } = data;
    const statusColors = {
      'pending': { bg: '#fef3c7', text: '#92400e' },
      'in_progress': { bg: '#dbeafe', text: '#1e40af' },
      'waiting_for_parts': { bg: '#fce7f3', text: '#9d174d' },
      'completed': { bg: '#d1fae5', text: '#065f46' },
      'delivered': { bg: '#d1fae5', text: '#065f46' },
      'cancelled': { bg: '#fee2e2', text: '#991b1b' }
    };
    const statusIcons = {
      'pending': '&#128337;',
      'in_progress': '&#128295;',
      'waiting_for_parts': '&#128230;',
      'completed': '&#10003;',
      'delivered': '&#128666;',
      'cancelled': '&#10005;'
    };
    const color = statusColors[newStatus] || { bg: '#f1f5f9', text: '#475569' };
    const icon = statusIcons[newStatus] || '&#128260;';

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: ${color.bg}; width: 70px; height: 70px; border-radius: 50%; line-height: 70px; margin-bottom: 15px;">
          <span style="color: ${color.text}; font-size: 32px;">${icon}</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">Status Update</h2>
      </div>
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; background: #e2e8f0; color: #64748b; padding: 6px 16px; border-radius: 20px; font-size: 13px; text-transform: uppercase;">${(oldStatus || 'previous').replace(/_/g, ' ')}</span>
          <span style="display: inline-block; margin: 0 10px; color: #94a3b8; font-size: 20px;">&#8594;</span>
          <span style="display: inline-block; background: ${color.bg}; color: ${color.text}; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase;">${(newStatus || '').replace(/_/g, ' ')}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Ticket Number</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: ${themeColor}; font-weight: 700;">${repair.invoice_number}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Device</td>
            <td style="padding: 12px 0; text-align: right; color: #1e293b; font-weight: 500;">${repair.brand || ''} ${repair.model || ''}</td>
          </tr>
        </table>
      </div>
      <div style="background: ${color.bg}; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <p style="margin: 0; color: ${color.text}; font-size: 15px; font-weight: 500;">${statusMessage}</p>
      </div>
      <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">Hi <strong>${customer.name}</strong>, we're keeping you updated!</p>`;
  }

  repairCompletedTemplate(data, themeColor) {
    const { customer, repair, invoice } = data;
    const businessAddress = getSetting('business_address') || 'Barrackpore, West Bengal';
    const businessPhone = getSetting('business_phone') || '+91 7003888936';

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 80px; height: 80px; border-radius: 50%; line-height: 80px; margin-bottom: 15px;">
          <span style="color: white; font-size: 40px;">&#10003;</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 28px; font-weight: 700;">Repair Complete!</h2>
        <p style="margin: 10px 0 0 0; color: #64748b; font-size: 16px;">Your device is ready for pickup</p>
      </div>
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; font-weight: 500;">TICKET NUMBER</p>
        <p style="margin: 0; color: #065f46; font-size: 28px; font-weight: 700; letter-spacing: 1px;">${repair.invoice_number}</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Repair Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Device</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${repair.brand || ''} ${repair.model || ''}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Issue Fixed</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${(repair.issue_description || '').substring(0, 40)}...</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Warranty</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #10b981; font-weight: 600;">${repair.warranty_days || 30} Days</td>
          </tr>
          ${invoice ? `<tr>
            <td style="padding: 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Total Amount</td>
            <td style="padding: 15px 0; text-align: right; color: ${themeColor}; font-size: 24px; font-weight: 700;">&#8377;${(invoice.total_amount || repair.final_price || 0).toFixed(2)}</td>
          </tr>` : ''}
        </table>
      </div>
      <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid ${themeColor};">
        <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Pickup Location</h4>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">${businessAddress}</p>
        <p style="margin: 5px 0 0 0; color: #1e40af; font-size: 14px;">Call us: <strong>${businessPhone}</strong></p>
      </div>
      <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">Hi <strong>${customer.name}</strong>, your device is ready!</p>`;
  }

  invoiceTemplate(data, themeColor) {
    const { customer, invoice, repair } = data;
    const upiId = getSetting('upi_id') || '';
    const dueDate = invoice.due_date 
      ? new Date(invoice.due_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Due on receipt';

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0; color: #1e293b; font-size: 28px; font-weight: 700;">Invoice</h2>
        <p style="margin: 10px 0 0 0; color: ${themeColor}; font-size: 18px; font-weight: 600;">#${invoice.invoice_number}</p>
      </div>
      <div style="margin-bottom: 30px;">
        <p style="margin: 0 0 5px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bill To</p>
        <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">${customer.name}</p>
        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">${customer.phone}</p>
        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">${customer.email}</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #e2e8f0;">
            <th style="padding: 12px; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase; border-radius: 8px 0 0 8px;">Description</th>
            <th style="padding: 12px; text-align: right; color: #475569; font-size: 12px; text-transform: uppercase; border-radius: 0 8px 8px 0;">Amount</th>
          </tr>
          ${repair ? `<tr>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
              <strong>${repair.device_type} Repair</strong><br>
              <span style="color: #64748b; font-size: 13px;">${repair.brand || ''} ${repair.model || ''} - ${(repair.issue_description || '').substring(0, 50)}...</span>
            </td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-size: 14px;">&#8377;${(repair.total_cost || 0).toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 12px; color: #64748b; font-size: 14px;">Subtotal</td>
            <td style="padding: 12px; text-align: right; color: #1e293b; font-size: 14px;">&#8377;${(invoice.subtotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #64748b; font-size: 14px;">GST (${invoice.gst_rate || 18}%)</td>
            <td style="padding: 12px; text-align: right; color: #1e293b; font-size: 14px;">&#8377;${(invoice.gst_amount || 0).toFixed(2)}</td>
          </tr>
          <tr style="background: linear-gradient(135deg, ${themeColor} 0%, #0369a1 100%);">
            <td style="padding: 15px 12px; color: #ffffff; font-size: 16px; font-weight: 600; border-radius: 0 0 0 8px;">Total Amount</td>
            <td style="padding: 15px 12px; text-align: right; color: #ffffff; font-size: 20px; font-weight: 700; border-radius: 0 0 8px 0;">&#8377;${(invoice.total_amount || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <table style="width: 100%; margin-bottom: 25px;">
        <tr>
          <td style="width: 48%; background: #fef3c7; border-radius: 12px; padding: 15px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #92400e; font-size: 12px; text-transform: uppercase;">Payment Status</p>
            <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 700;">${(invoice.payment_status || 'UNPAID').toUpperCase()}</p>
          </td>
          <td style="width: 4%;"></td>
          <td style="width: 48%; background: #eff6ff; border-radius: 12px; padding: 15px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #1e40af; font-size: 12px; text-transform: uppercase;">Due Date</p>
            <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 700;">${dueDate}</p>
          </td>
        </tr>
      </table>
      ${upiId ? `<div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center; border: 1px solid #bbf7d0;">
        <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: 600;">Pay via UPI</p>
        <p style="margin: 0; color: #166534; font-size: 18px; font-weight: 700;">${upiId}</p>
      </div>` : ''}
      <p style="margin: 0; color: #64748b; font-size: 13px; text-align: center;">Thank you for your business!</p>`;
  }

  paymentReceivedTemplate(data, themeColor) {
    const { customer, invoice } = data;
    const businessName = getSetting('business_name') || 'ByteCare';

    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 80px; height: 80px; border-radius: 50%; line-height: 80px; margin-bottom: 15px;">
          <span style="color: white; font-size: 40px;">&#10003;</span>
        </div>
        <h2 style="margin: 0; color: #1e293b; font-size: 28px; font-weight: 700;">Payment Received!</h2>
        <p style="margin: 10px 0 0 0; color: #64748b; font-size: 16px;">Thank you for your payment</p>
      </div>
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 30px; margin-bottom: 25px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px;">Amount Paid</p>
        <p style="margin: 0; color: #065f46; font-size: 36px; font-weight: 700;">&#8377;${(invoice.total_amount || 0).toFixed(2)}</p>
        <p style="margin: 15px 0 0 0; color: #065f46; font-size: 14px;">Invoice #${invoice.invoice_number}</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #1e293b; font-size: 15px;"><strong>Payment Status:</strong> <span style="display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px;">PAID</span></p>
      </div>
      <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">Hi <strong>${customer.name}</strong>, thank you for choosing ${businessName}!</p>`;
  }

  generateEmailHTML(body, invoice, businessName) {
    const themeColor = getSetting('theme_color') || '#0EA5E9';
    const businessPhone = getSetting('business_phone') || '+91 7003888936';
    const businessAddress = getSetting('business_address') || 'Barrackpore, West Bengal';
    
    let invoiceDetails = '';
    if (invoice) {
      invoiceDetails = `
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Invoice Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b;">Invoice Number:</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${invoice.invoice_number}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Subtotal:</td><td style="padding: 8px 0; text-align: right;">&#8377;${(invoice.subtotal || 0).toFixed(2)}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">GST (${invoice.gst_rate || 18}%):</td><td style="padding: 8px 0; text-align: right;">&#8377;${(invoice.gst_amount || 0).toFixed(2)}</td></tr>
            <tr style="border-top: 2px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 600; font-size: 18px;">Total:</td><td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 18px; color: ${themeColor};">&#8377;${(invoice.total_amount || 0).toFixed(2)}</td></tr>
          </table>
        </div>`;
    }

    const content = `<div style="white-space: pre-line; font-size: 15px; color: #475569;">${body}</div>${invoiceDetails}`;
    return this.wrapInEmailLayout(content, businessName, themeColor, businessPhone, businessAddress);
  }

  async verifyApiKey() {
    try {
      this.initialize();
      const response = await axios.get(`https://api.mailgun.net/v3/domains/${this.domain}`, {
        auth: { username: 'api', password: this.apiKey }
      });
      return { success: true, domain: response.data?.domain?.name, state: response.data?.domain?.state };
    } catch (error) {
      logger.error('Mailgun verification error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
}

module.exports = new MailgunService();
