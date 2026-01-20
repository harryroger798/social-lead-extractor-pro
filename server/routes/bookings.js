const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase, getNextInvoiceNumber, getSetting } = require('../database/db');
const { asyncHandler, ValidationError, logger } = require('../middleware/errorHandler');
const { REPAIR_STATUS, DEVICE_TYPES, PRIORITY, CUSTOMER_SOURCES } = require('../config/constants');
const mailgunService = require('../services/mailgunService');

const router = express.Router();

// Map frontend device types to backend device types
const deviceTypeMap = {
  'smartphone': DEVICE_TYPES.MOBILE,
  'laptop': DEVICE_TYPES.LAPTOP,
  'tablet': DEVICE_TYPES.TABLET,
  'desktop': DEVICE_TYPES.PC,
  'smartwatch': DEVICE_TYPES.OTHER,
  'other': DEVICE_TYPES.OTHER
};

// Validation for public booking
const bookingValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .customSanitizer(value => {
      if (!value) return value;
      let cleaned = value.replace(/[^0-9]/g, '');
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
      }
      return cleaned;
    })
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('deviceType')
    .notEmpty()
    .withMessage('Device type is required'),
  body('issue')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Issue description must be between 10 and 2000 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('date')
    .notEmpty()
    .withMessage('Preferred date is required'),
  body('time')
    .notEmpty()
    .withMessage('Preferred time is required')
];

// Helper function to send booking confirmation email
const sendBookingConfirmationEmail = async (customer, repair, bookingDetails) => {
  try {
    const mailgunEnabled = getSetting('mailgun_enabled') === '1';
    const mailgunApiKey = getSetting('mailgun_api_key');
    
    if (!mailgunEnabled || !mailgunApiKey) {
      logger.info('Mailgun not configured, skipping booking confirmation email');
      return;
    }

    if (!customer.email) {
      logger.info('Customer has no email, skipping booking confirmation email');
      return;
    }

    const businessName = getSetting('business_name') || 'ByteCare';
    const businessPhone = getSetting('business_phone') || '+91 7003888936';
    const themeColor = getSetting('theme_color') || '#0EA5E9';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, ${themeColor} 0%, #0369a1 100%); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${businessName}</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Your Trusted Repair Partner</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 25px 20px;">
              <div style="text-align: center; padding-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto; line-height: 60px;">
                  <span style="color: white; font-size: 28px;">&#10003;</span>
                </div>
                <h2 style="margin: 15px 0 0 0; color: #1e293b; font-size: 22px;">Booking Confirmed!</h2>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">We've received your repair booking request.</p>
              </div>
              
              <div style="background: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 15px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Booking Details</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Ticket #</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: ${themeColor}; font-weight: 700;">${repair.invoice_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Device</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${repair.brand || ''} ${repair.model || ''} (${repair.device_type})</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Scheduled Date</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${bookingDetails.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Scheduled Time</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 500;">${bookingDetails.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Status</td>
                    <td style="padding: 10px 0; text-align: right;"><span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">PENDING</span></td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 15px; background: #eff6ff; border-radius: 10px; border-left: 3px solid ${themeColor}; padding: 15px;">
                <p style="margin: 0; color: #1e40af; font-size: 13px;"><strong>What's next?</strong><br>Our team will contact you shortly to confirm the appointment. You can also track your repair at <a href="https://bytecare.shop/track" style="color: ${themeColor}; font-weight: 600;">bytecare.shop/track</a></p>
              </div>
              
              <p style="margin-top: 15px; text-align: center; color: #64748b; font-size: 13px;">Hi <strong>${customer.name}</strong>, thank you for choosing us!</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1e293b; padding: 25px 20px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;">Need help? We're here for you!</p>
              <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${businessPhone}</p>
              <a href="https://bytecare.shop" style="color: ${themeColor}; text-decoration: none; font-size: 12px;">Visit our website</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await mailgunService.sendEmail({
      recipient: customer.email,
      subject: `Booking Confirmed - ${repair.invoice_number} | ${businessName}`,
      body: `Your repair booking has been confirmed. Ticket: ${repair.invoice_number}. Scheduled: ${bookingDetails.date} at ${bookingDetails.time}. We'll contact you shortly.`,
      template: null,
      data: null
    });

    // Override with custom HTML
    mailgunService.initialize();
    const businessEmail = getSetting('business_email') || `support@${mailgunService.domain}`;
    
    const formData = new URLSearchParams();
    formData.append('from', `${businessName} <${businessEmail}>`);
    formData.append('to', customer.email);
    formData.append('subject', `Booking Confirmed - ${repair.invoice_number} | ${businessName}`);
    formData.append('html', htmlContent);
    formData.append('text', `Your repair booking has been confirmed. Ticket: ${repair.invoice_number}. Scheduled: ${bookingDetails.date} at ${bookingDetails.time}. We'll contact you shortly.`);

    await mailgunService.client.post('/messages', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    logger.info(`Booking confirmation email sent to ${customer.email}`);
  } catch (error) {
    logger.error('Failed to send booking confirmation email:', error.message);
  }
};

// Helper function to send admin notification email
const sendAdminNotificationEmail = async (customer, repair, bookingDetails) => {
  try {
    const mailgunEnabled = getSetting('mailgun_enabled') === '1';
    const mailgunApiKey = getSetting('mailgun_api_key');
    
    if (!mailgunEnabled || !mailgunApiKey) {
      logger.info('Mailgun not configured, skipping admin notification email');
      return;
    }

    const adminEmail = getSetting('business_email') || 'harryroger798@gmail.com';
    const businessName = getSetting('business_name') || 'ByteCare';

    const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="color: #0EA5E9;">New Booking Received!</h2>
  <p>A new repair booking has been submitted through the website.</p>
  
  <h3>Customer Details:</h3>
  <ul>
    <li><strong>Name:</strong> ${customer.name}</li>
    <li><strong>Phone:</strong> ${customer.phone}</li>
    <li><strong>Email:</strong> ${customer.email || 'Not provided'}</li>
  </ul>
  
  <h3>Booking Details:</h3>
  <ul>
    <li><strong>Ticket #:</strong> ${repair.invoice_number}</li>
    <li><strong>Device:</strong> ${repair.brand || ''} ${repair.model || ''} (${repair.device_type})</li>
    <li><strong>Issue:</strong> ${repair.issue_description}</li>
    <li><strong>Scheduled Date:</strong> ${bookingDetails.date}</li>
    <li><strong>Scheduled Time:</strong> ${bookingDetails.time}</li>
  </ul>
  
  <p><a href="https://bytecare.shop/login" style="background: #0EA5E9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a></p>
</body>
</html>`;

    mailgunService.initialize();
    const businessEmail = getSetting('business_email') || `support@${mailgunService.domain}`;
    
    const formData = new URLSearchParams();
    formData.append('from', `${businessName} <${businessEmail}>`);
    formData.append('to', adminEmail);
    formData.append('subject', `New Booking: ${customer.name} - ${repair.device_type} | ${businessName}`);
    formData.append('html', htmlContent);
    formData.append('text', `New booking from ${customer.name} (${customer.phone}). Device: ${repair.device_type}. Issue: ${repair.issue_description}. Scheduled: ${bookingDetails.date} at ${bookingDetails.time}.`);

    await mailgunService.client.post('/messages', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    logger.info(`Admin notification email sent to ${adminEmail}`);
  } catch (error) {
    logger.error('Failed to send admin notification email:', error.message);
  }
};

// PUBLIC ROUTE - No authentication required
router.post('/', bookingValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { name, phone, email, deviceType, brand, model, issue, date, time } = req.body;
  const db = getDatabase();

  // Map frontend device type to backend device type
  const mappedDeviceType = deviceTypeMap[deviceType] || DEVICE_TYPES.OTHER;

  // Find or create customer
  let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
  
  if (!customer) {
    // Create new customer
    const customerStmt = db.prepare(`
      INSERT INTO customers (name, phone, email, source, city)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const customerResult = customerStmt.run(
      name,
      phone,
      email || null,
      CUSTOMER_SOURCES.OTHER, // Website booking
      'Barrackpore'
    );
    
    customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerResult.lastInsertRowid);
    logger.info(`New customer created: ${customer.id} - ${name}`);
  } else {
    // Update customer info if needed
    if (email && !customer.email) {
      db.prepare('UPDATE customers SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(email, customer.id);
      customer.email = email;
    }
  }

  // Create repair ticket
  const invoiceNumber = getNextInvoiceNumber();
  
  // Create notes with booking details
  const bookingNotes = `Online Booking - Scheduled: ${date} at ${time}`;
  
  const repairStmt = db.prepare(`
    INSERT INTO repairs (
      invoice_number, customer_id, device_type, brand, model,
      issue_description, status, priority, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const repairResult = repairStmt.run(
    invoiceNumber,
    customer.id,
    mappedDeviceType,
    brand || null,
    model || null,
    issue,
    REPAIR_STATUS.PENDING,
    PRIORITY.NORMAL,
    bookingNotes
  );

  // Update customer repair count
  db.prepare('UPDATE customers SET repair_count = repair_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(customer.id);

  const repair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(repairResult.lastInsertRowid);

  logger.info(`New booking created: ${invoiceNumber} for customer ${customer.name}`);

  // Send emails (non-blocking)
  const bookingDetails = { date, time };
  sendBookingConfirmationEmail(customer, repair, bookingDetails);
  sendAdminNotificationEmail(customer, repair, bookingDetails);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      invoice_number: invoiceNumber,
      customer_name: customer.name,
      device_type: mappedDeviceType,
      scheduled_date: date,
      scheduled_time: time,
      status: REPAIR_STATUS.PENDING
    }
  });
}));

module.exports = router;
