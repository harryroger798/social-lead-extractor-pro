const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const { getSetting } = require('../database/db');
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');
const { logger } = require('../middleware/errorHandler');
const mailgunService = require('../services/mailgunService');

const router = express.Router();

const SANITY_PROJECT_ID = '75uz5ykn';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_TOKEN = 'skoIi7B47AYT2FIVA2KjVjo1ATATGHmAwclzek737l5KePmonsrUJS4HYzqQcC43IN2kICgz0l8qE1nDqxMDj8N9Swib5hqYe30WLvCHt2eZcVwlITiQrvw7ppyLSxoUl7cBsYuTraE7pr1JqN7YZtdvkV4SuUrXKsIXXQvYvgXbFX54NQ1L';

const sanityClient = axios.create({
  baseURL: `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SANITY_TOKEN}`
  }
});

router.post('/comments', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('content').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  body('postId').notEmpty().withMessage('Post ID is required'),
  body('honeypot').optional()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { name, email, content, postId, honeypot } = req.body;

  if (honeypot) {
    logger.warn('Honeypot triggered - spam detected', { email, ip: req.ip });
    return res.json({
      success: true,
      message: 'Comment submitted for review'
    });
  }

  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';

  try {
    const comment = {
      _type: 'comment',
      name,
      email,
      content,
      post: {
        _type: 'reference',
        _ref: postId
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      ipAddress,
      userAgent
    };

    const response = await sanityClient.post('', {
      mutations: [{ create: comment }]
    });

    logger.info('Comment submitted to Sanity', { 
      postId, 
      name, 
      transactionId: response.data?.transactionId 
    });

    res.json({
      success: true,
      message: 'Comment submitted for review. It will appear after approval.',
      data: {
        transactionId: response.data?.transactionId
      }
    });
  } catch (error) {
    logger.error('Failed to submit comment to Sanity', {
      error: error.message,
      postId,
      name
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit comment',
      message: 'Please try again later'
    });
  }
}));

router.get('/comments/:postId', asyncHandler(async (req, res) => {
  const { postId } = req.params;

  try {
    const query = encodeURIComponent(`*[_type == "comment" && post._ref == "${postId}" && status == "approved"] | order(createdAt desc) { _id, name, content, createdAt }`);
    
    const response = await axios.get(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`
    );

    res.json({
      success: true,
      data: response.data?.result || []
    });
  } catch (error) {
    logger.error('Failed to fetch comments from Sanity', {
      error: error.message,
      postId
    });
    
    res.json({
      success: true,
      data: []
    });
  }
}));

router.post('/newsletter/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('honeypot').optional()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { email, honeypot } = req.body;

  if (honeypot) {
    logger.warn('Newsletter honeypot triggered - spam detected', { email, ip: req.ip });
    return res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  }

  try {
    const mailgunApiKey = getSetting('mailgun_api_key');
    const mailgunDomain = getSetting('mailgun_domain') || 'mail.bytecare.shop';
    
    if (!mailgunApiKey) {
      logger.warn('Mailgun not configured for newsletter');
      return res.json({
        success: true,
        message: 'Successfully subscribed to newsletter'
      });
    }

    const businessName = getSetting('business_name') || 'ByteCare';

    const client = axios.create({
      baseURL: `https://api.mailgun.net/v3/${mailgunDomain}`,
      auth: {
        username: 'api',
        password: mailgunApiKey
      }
    });

    const formData = new URLSearchParams();
    formData.append('from', `${businessName} Newsletter <newsletter@${mailgunDomain}>`);
    formData.append('to', email);
    formData.append('subject', `Welcome to ${businessName} Newsletter!`);
    formData.append('html', generateWelcomeEmail(businessName, email));
    formData.append('text', `Welcome to ${businessName} Newsletter! Thank you for subscribing. You'll receive the latest tech tips, repair guides, and exclusive offers directly in your inbox.`);

    await client.post('/messages', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    logger.info('Newsletter subscription welcome email sent', { email });

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for confirmation.'
    });
  } catch (error) {
    logger.error('Failed to send newsletter welcome email', {
      error: error.message,
      email
    });
    
    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  }
}));

function generateWelcomeEmail(businessName, email) {
  const themeColor = getSetting('theme_color') || '#0EA5E9';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${businessName} Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, ${themeColor} 0%, #0369a1 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to ${businessName}!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for subscribing to our newsletter</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                Hi there! 
              </p>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                You've successfully subscribed to the ${businessName} newsletter. Here's what you can expect:
              </p>
              <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #64748b; font-size: 15px; line-height: 1.8;">
                <li>Latest tech tips and repair guides</li>
                <li>Exclusive offers and discounts</li>
                <li>Industry news and updates</li>
                <li>Device maintenance tips</li>
              </ul>
              <p style="margin: 0 0 25px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                We promise not to spam you - only valuable content delivered to your inbox!
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: ${themeColor}; border-radius: 8px;">
                    <a href="https://bytecare.shop/blog" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px;">Read Our Blog</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1e293b; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px;">
                ${businessName} - Your Trusted Repair Partner
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                Barrackpore, West Bengal, India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = router;
