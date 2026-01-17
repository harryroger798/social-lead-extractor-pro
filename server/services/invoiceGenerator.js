const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { getDatabase, getSetting } = require('../database/db');
const { logger } = require('../middleware/errorHandler');
const paymentQRCode = require('./paymentQRCode');

const INVOICES_DIR = path.join(__dirname, '..', 'generated', 'invoices');

if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

class InvoiceGenerator {
  constructor() {
    this.defaultMargin = 50;
    this.pageWidth = 595.28;
    this.pageHeight = 841.89;
  }

  async generateInvoicePDF(invoiceId) {
    const db = getDatabase();

    const invoice = db.prepare(`
      SELECT 
        i.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        c.city as customer_city,
        c.gst_number as customer_gst
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `).get(invoiceId);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    let repair = null;
    let digitalService = null;

    if (invoice.repair_id) {
      repair = db.prepare(`
        SELECT r.*, s.name as service_name, s.category as service_category
        FROM repairs r
        LEFT JOIN services s ON r.service_id = s.id
        WHERE r.id = ?
      `).get(invoice.repair_id);
    }

    if (invoice.digital_service_id) {
      digitalService = db.prepare(`
        SELECT * FROM digital_services WHERE id = ?
      `).get(invoice.digital_service_id);
    }

    const payments = db.prepare(`
      SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date
    `).all(invoiceId);

    const businessName = getSetting('business_name') || 'ByteCare';
    const businessAddress = getSetting('business_address') || '';
    const businessPhone = getSetting('business_phone') || '';
    const businessEmail = getSetting('business_email') || '';
    const businessGST = getSetting('gst_number') || '';
    const themeColor = getSetting('theme_color') || '#2563eb';

    const filename = `invoice_${invoice.invoice_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(INVOICES_DIR, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: this.defaultMargin,
          info: {
            Title: `Invoice ${invoice.invoice_number}`,
            Author: businessName,
            Subject: 'Invoice',
            Creator: 'ByteCare Management System'
          }
        });

        const writeStream = fs.createWriteStream(filepath);
        doc.pipe(writeStream);

        this.drawHeader(doc, businessName, businessAddress, businessPhone, businessEmail, businessGST, themeColor);

        this.drawInvoiceInfo(doc, invoice);

        this.drawCustomerInfo(doc, invoice);

        if (repair) {
          this.drawRepairDetails(doc, repair, invoice);
        } else if (digitalService) {
          this.drawDigitalServiceDetails(doc, digitalService, invoice);
        }

        this.drawTotals(doc, invoice);

        if (payments.length > 0) {
          this.drawPaymentHistory(doc, payments);
        }

        if (invoice.payment_status !== 'paid') {
          this.drawPaymentQR(doc, invoice, businessName);
        }

        this.drawFooter(doc, invoice, businessName);

        doc.end();

        writeStream.on('finish', () => {
          resolve({
            success: true,
            filename,
            filepath,
            invoice_number: invoice.invoice_number
          });
        });

        writeStream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  drawHeader(doc, businessName, address, phone, email, gst, themeColor) {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 37, g: 99, b: 235 };
    };

    const rgb = hexToRgb(themeColor);

    doc.rect(0, 0, this.pageWidth, 120)
       .fill([rgb.r, rgb.g, rgb.b]);

    doc.fillColor('white')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(businessName, this.defaultMargin, 35);

    doc.fontSize(10)
       .font('Helvetica')
       .text(address, this.defaultMargin, 70)
       .text(`Phone: ${phone} | Email: ${email}`, this.defaultMargin, 85);

    if (gst) {
      doc.text(`GSTIN: ${gst}`, this.defaultMargin, 100);
    }

    doc.fillColor('black');
    doc.y = 140;
  }

  drawInvoiceInfo(doc, invoice) {
    const startY = 150;

    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('TAX INVOICE', this.defaultMargin, startY);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#64748b');

    const rightCol = this.pageWidth - this.defaultMargin - 150;

    doc.text('Invoice Number:', rightCol, startY)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text(invoice.invoice_number, rightCol + 90, startY);

    doc.font('Helvetica')
       .fillColor('#64748b')
       .text('Invoice Date:', rightCol, startY + 15)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text(new Date(invoice.invoice_date).toLocaleDateString('en-IN'), rightCol + 90, startY + 15);

    if (invoice.due_date) {
      doc.font('Helvetica')
         .fillColor('#64748b')
         .text('Due Date:', rightCol, startY + 30)
         .font('Helvetica-Bold')
         .fillColor('#1e293b')
         .text(new Date(invoice.due_date).toLocaleDateString('en-IN'), rightCol + 90, startY + 30);
    }

    doc.y = startY + 60;
  }

  drawCustomerInfo(doc, invoice) {
    const startY = doc.y;

    doc.rect(this.defaultMargin, startY, this.pageWidth - 2 * this.defaultMargin, 80)
       .fill('#f8fafc');

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Bill To:', this.defaultMargin + 15, startY + 15);

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(invoice.customer_name, this.defaultMargin + 15, startY + 32);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569');

    let customerY = startY + 48;

    if (invoice.customer_address) {
      doc.text(invoice.customer_address, this.defaultMargin + 15, customerY);
      customerY += 12;
    }

    if (invoice.customer_city) {
      doc.text(invoice.customer_city, this.defaultMargin + 15, customerY);
      customerY += 12;
    }

    doc.text(`Phone: ${invoice.customer_phone}`, this.defaultMargin + 15, customerY);

    if (invoice.customer_gst) {
      doc.text(`GSTIN: ${invoice.customer_gst}`, this.pageWidth / 2, startY + 48);
    }

    doc.y = startY + 100;
  }

  drawRepairDetails(doc, repair, invoice) {
    const startY = doc.y;

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Service Details', this.defaultMargin, startY);

    const tableTop = startY + 25;
    const col1 = this.defaultMargin;
    const col2 = this.defaultMargin + 250;
    const col3 = this.defaultMargin + 350;
    const col4 = this.pageWidth - this.defaultMargin - 80;

    doc.rect(col1, tableTop, this.pageWidth - 2 * this.defaultMargin, 25)
       .fill('#e2e8f0');

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Description', col1 + 10, tableTop + 8)
       .text('Qty', col2, tableTop + 8)
       .text('Rate', col3, tableTop + 8)
       .text('Amount', col4, tableTop + 8);

    let rowY = tableTop + 30;

    doc.font('Helvetica')
       .fillColor('#334155');

    doc.text(`${repair.service_name || 'Repair Service'}`, col1 + 10, rowY, { width: 230 });
    doc.text(`Device: ${repair.device_type} - ${repair.brand} ${repair.model}`, col1 + 10, rowY + 12, { width: 230 });
    doc.text('1', col2, rowY);
    doc.text(`₹${repair.labor_cost?.toFixed(2) || '0.00'}`, col3, rowY);
    doc.text(`₹${repair.labor_cost?.toFixed(2) || '0.00'}`, col4, rowY);

    rowY += 35;

    if (repair.parts_cost > 0) {
      doc.text('Parts & Components', col1 + 10, rowY);
      doc.text('1', col2, rowY);
      doc.text(`₹${repair.parts_cost?.toFixed(2)}`, col3, rowY);
      doc.text(`₹${repair.parts_cost?.toFixed(2)}`, col4, rowY);
      rowY += 20;
    }

    doc.moveTo(col1, rowY)
       .lineTo(this.pageWidth - this.defaultMargin, rowY)
       .stroke('#e2e8f0');

    doc.y = rowY + 15;
  }

  drawDigitalServiceDetails(doc, service, invoice) {
    const startY = doc.y;

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Service Details', this.defaultMargin, startY);

    const tableTop = startY + 25;
    const col1 = this.defaultMargin;
    const col4 = this.pageWidth - this.defaultMargin - 80;

    doc.rect(col1, tableTop, this.pageWidth - 2 * this.defaultMargin, 25)
       .fill('#e2e8f0');

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Description', col1 + 10, tableTop + 8)
       .text('Amount', col4, tableTop + 8);

    let rowY = tableTop + 30;

    doc.font('Helvetica')
       .fillColor('#334155');

    doc.text(`${service.title}`, col1 + 10, rowY, { width: 350 });
    doc.text(`Type: ${service.service_type}`, col1 + 10, rowY + 12);
    doc.text(`₹${service.amount?.toFixed(2) || '0.00'}`, col4, rowY);

    rowY += 35;

    doc.moveTo(col1, rowY)
       .lineTo(this.pageWidth - this.defaultMargin, rowY)
       .stroke('#e2e8f0');

    doc.y = rowY + 15;
  }

  drawTotals(doc, invoice) {
    const startY = doc.y + 10;
    const rightCol = this.pageWidth - this.defaultMargin - 200;

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#64748b')
       .text('Subtotal:', rightCol, startY)
       .fillColor('#1e293b')
       .text(`₹${invoice.subtotal?.toFixed(2) || '0.00'}`, rightCol + 120, startY, { align: 'right', width: 80 });

    if (invoice.discount_amount > 0) {
      doc.fillColor('#64748b')
         .text('Discount:', rightCol, startY + 18)
         .fillColor('#16a34a')
         .text(`-₹${invoice.discount_amount?.toFixed(2)}`, rightCol + 120, startY + 18, { align: 'right', width: 80 });
    }

    const gstY = invoice.discount_amount > 0 ? startY + 36 : startY + 18;

    doc.fillColor('#64748b')
       .text(`GST (${invoice.gst_rate || 18}%):`, rightCol, gstY)
       .fillColor('#1e293b')
       .text(`₹${invoice.gst_amount?.toFixed(2) || '0.00'}`, rightCol + 120, gstY, { align: 'right', width: 80 });

    const totalY = gstY + 25;

    doc.rect(rightCol - 10, totalY - 5, 220, 30)
       .fill('#1e293b');

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('white')
       .text('Total Amount:', rightCol, totalY + 3)
       .text(`₹${invoice.total_amount?.toFixed(2) || '0.00'}`, rightCol + 100, totalY + 3, { align: 'right', width: 100 });

    doc.fillColor('black');
    doc.y = totalY + 45;
  }

  drawPaymentHistory(doc, payments) {
    const startY = doc.y + 10;

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Payment History', this.defaultMargin, startY);

    let rowY = startY + 20;

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#475569');

    payments.forEach(payment => {
      doc.text(new Date(payment.payment_date).toLocaleDateString('en-IN'), this.defaultMargin, rowY)
         .text(payment.payment_method, this.defaultMargin + 80, rowY)
         .text(`₹${payment.amount?.toFixed(2)}`, this.defaultMargin + 180, rowY)
         .text(payment.reference_number || '-', this.defaultMargin + 260, rowY);
      rowY += 15;
    });

    doc.y = rowY + 10;
  }

  drawPaymentQR(doc, invoice, businessName) {
    const upiId = getSetting('upi_id');
    
    if (!upiId) {
      return;
    }

    const startY = doc.y + 10;

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Scan to Pay', this.defaultMargin, startY);

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#64748b')
       .text('Scan the QR code with any UPI app to make payment', this.defaultMargin, startY + 15);

    doc.y = startY + 100;
  }

  drawFooter(doc, invoice, businessName) {
    const footerY = this.pageHeight - 100;

    doc.moveTo(this.defaultMargin, footerY)
       .lineTo(this.pageWidth - this.defaultMargin, footerY)
       .stroke('#e2e8f0');

    if (invoice.terms) {
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#1e293b')
         .text('Terms & Conditions:', this.defaultMargin, footerY + 10);

      doc.font('Helvetica')
         .fillColor('#64748b')
         .text(invoice.terms, this.defaultMargin, footerY + 22, {
           width: this.pageWidth - 2 * this.defaultMargin
         });
    }

    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text(`Generated by ${businessName} Management System`, this.defaultMargin, this.pageHeight - 40, {
         align: 'center',
         width: this.pageWidth - 2 * this.defaultMargin
       });
  }

  async getInvoicePDF(invoiceId) {
    const db = getDatabase();
    const invoice = db.prepare('SELECT invoice_number FROM invoices WHERE id = ?').get(invoiceId);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const filename = `invoice_${invoice.invoice_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(INVOICES_DIR, filename);

    if (fs.existsSync(filepath)) {
      return {
        exists: true,
        filename,
        filepath
      };
    }

    return this.generateInvoicePDF(invoiceId);
  }
}

module.exports = new InvoiceGenerator();
