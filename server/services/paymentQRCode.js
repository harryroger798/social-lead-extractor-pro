const QRCode = require('qrcode');
const { getSetting } = require('../database/db');
const { logger } = require('../middleware/errorHandler');

class PaymentQRCode {
  generateUPIString(options) {
    const {
      upiId,
      payeeName,
      amount,
      transactionNote,
      transactionRef,
      currency = 'INR'
    } = options;

    if (!upiId) {
      throw new Error('UPI ID is required');
    }

    const params = new URLSearchParams();
    params.append('pa', upiId);
    
    if (payeeName) {
      params.append('pn', payeeName.substring(0, 50));
    }
    
    if (amount && amount > 0) {
      params.append('am', amount.toFixed(2));
    }
    
    params.append('cu', currency);
    
    if (transactionNote) {
      params.append('tn', transactionNote.substring(0, 50));
    }
    
    if (transactionRef) {
      params.append('tr', transactionRef.substring(0, 35));
    }

    return `upi://pay?${params.toString()}`;
  }

  async generateQRCode(options) {
    const upiString = this.generateUPIString(options);

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return {
        success: true,
        qr_code: qrCodeDataUrl,
        upi_string: upiString
      };
    } catch (error) {
      logger.error('QR Code generation error:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generateInvoiceQR(invoice) {
    const upiId = getSetting('upi_id');
    const businessName = getSetting('business_name') || 'ByteCare';

    if (!upiId) {
      throw new Error('UPI ID not configured. Please set up UPI ID in settings.');
    }

    const pendingAmount = invoice.total_amount - (invoice.paid_amount || 0);

    if (pendingAmount <= 0) {
      return {
        success: false,
        message: 'Invoice is already fully paid'
      };
    }

    return this.generateQRCode({
      upiId,
      payeeName: businessName,
      amount: pendingAmount,
      transactionNote: `Invoice ${invoice.invoice_number}`,
      transactionRef: invoice.invoice_number
    });
  }

  async generateCustomQR(amount, note) {
    const upiId = getSetting('upi_id');
    const businessName = getSetting('business_name') || 'ByteCare';

    if (!upiId) {
      throw new Error('UPI ID not configured. Please set up UPI ID in settings.');
    }

    return this.generateQRCode({
      upiId,
      payeeName: businessName,
      amount: amount || null,
      transactionNote: note || 'Payment'
    });
  }

  async generateQRBuffer(options) {
    const upiString = this.generateUPIString(options);

    try {
      const buffer = await QRCode.toBuffer(upiString, {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 300,
        margin: 2
      });

      return {
        success: true,
        buffer,
        upi_string: upiString,
        content_type: 'image/png'
      };
    } catch (error) {
      logger.error('QR Code buffer generation error:', error);
      throw new Error(`Failed to generate QR code buffer: ${error.message}`);
    }
  }

  async generateSVG(options) {
    const upiString = this.generateUPIString(options);

    try {
      const svg = await QRCode.toString(upiString, {
        errorCorrectionLevel: 'M',
        type: 'svg',
        width: 300,
        margin: 2
      });

      return {
        success: true,
        svg,
        upi_string: upiString,
        content_type: 'image/svg+xml'
      };
    } catch (error) {
      logger.error('QR Code SVG generation error:', error);
      throw new Error(`Failed to generate QR code SVG: ${error.message}`);
    }
  }

  validateUPIId(upiId) {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId);
  }

  getPaymentApps() {
    return [
      { name: 'Google Pay', scheme: 'tez://', icon: 'gpay' },
      { name: 'PhonePe', scheme: 'phonepe://', icon: 'phonepe' },
      { name: 'Paytm', scheme: 'paytmmp://', icon: 'paytm' },
      { name: 'BHIM', scheme: 'bhim://', icon: 'bhim' },
      { name: 'Amazon Pay', scheme: 'amazonpay://', icon: 'amazonpay' }
    ];
  }

  generateDeepLinks(options) {
    const upiString = this.generateUPIString(options);
    const apps = this.getPaymentApps();

    return apps.map(app => ({
      ...app,
      deepLink: upiString.replace('upi://', app.scheme)
    }));
  }
}

module.exports = new PaymentQRCode();
