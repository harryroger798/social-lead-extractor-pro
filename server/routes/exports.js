const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase, getSetting } = require('../database/db');
const { authenticate, isAdminOrTechnician } = require('../middleware/auth');
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');

const router = express.Router();

router.post('/csv', authenticate, isAdminOrTechnician, [
  body('table').isIn(['customers', 'repairs', 'invoices', 'digital_services', 'payments']).withMessage('Invalid table'),
  body('date_from').optional().isISO8601(),
  body('date_to').optional().isISO8601()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { table, date_from, date_to, columns } = req.body;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (date_from) {
    whereClause += ' AND created_at >= ?';
    params.push(date_from);
  }
  
  if (date_to) {
    whereClause += ' AND created_at <= ?';
    params.push(date_to);
  }
  
  const data = db.prepare(`SELECT * FROM ${table} WHERE ${whereClause} ORDER BY created_at DESC`).all(...params);
  
  if (data.length === 0) {
    return res.json({
      success: true,
      message: 'No data found for export',
      data: { csv: '', count: 0 }
    });
  }
  
  const headers = columns || Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  const csv = csvRows.join('\n');
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.EXPORT, table, null, null, { count: data.length, format: 'csv' }, req);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${table}_export_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
}));

router.post('/gstr1', authenticate, isAdminOrTechnician, [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) is required'),
  body('year').isInt({ min: 2020, max: 2100 }).withMessage('Valid year is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { month, year } = req.body;
  const db = getDatabase();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  
  const invoices = db.prepare(`
    SELECT 
      i.*,
      c.name as customer_name,
      c.gst_number as customer_gst,
      c.address as customer_address,
      c.city as customer_city
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.invoice_date >= ? AND i.invoice_date <= ?
      AND i.payment_status = 'paid'
    ORDER BY i.invoice_date
  `).all(startDate, endDate);
  
  const b2bInvoices = invoices.filter(inv => inv.customer_gst);
  const b2cInvoices = invoices.filter(inv => !inv.customer_gst);
  
  const gstr1Data = {
    gstin: getSetting('gst_number') || '',
    fp: `${String(month).padStart(2, '0')}${year}`,
    b2b: b2bInvoices.map(inv => ({
      ctin: inv.customer_gst,
      inv: [{
        inum: inv.invoice_number,
        idt: new Date(inv.invoice_date).toLocaleDateString('en-IN'),
        val: inv.total_amount,
        pos: '19',
        rchrg: 'N',
        inv_typ: 'R',
        itms: [{
          num: 1,
          itm_det: {
            txval: inv.subtotal,
            rt: inv.gst_rate,
            camt: inv.gst_amount / 2,
            samt: inv.gst_amount / 2,
            csamt: 0
          }
        }]
      }]
    })),
    b2cs: b2cInvoices.length > 0 ? [{
      sply_ty: 'INTRA',
      pos: '19',
      typ: 'OE',
      txval: b2cInvoices.reduce((sum, inv) => sum + inv.subtotal, 0),
      rt: 18,
      camt: b2cInvoices.reduce((sum, inv) => sum + inv.gst_amount / 2, 0),
      samt: b2cInvoices.reduce((sum, inv) => sum + inv.gst_amount / 2, 0),
      csamt: 0
    }] : [],
    summary: {
      total_invoices: invoices.length,
      b2b_count: b2bInvoices.length,
      b2c_count: b2cInvoices.length,
      total_taxable_value: invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
      total_cgst: invoices.reduce((sum, inv) => sum + inv.gst_amount / 2, 0),
      total_sgst: invoices.reduce((sum, inv) => sum + inv.gst_amount / 2, 0),
      total_tax: invoices.reduce((sum, inv) => sum + inv.gst_amount, 0),
      total_invoice_value: invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    }
  };
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.EXPORT, 'invoices', null, null, { type: 'GSTR1', month, year }, req);
  
  res.json({
    success: true,
    message: 'GSTR-1 data generated',
    data: gstr1Data
  });
}));

router.post('/gstr3b', authenticate, isAdminOrTechnician, [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) is required'),
  body('year').isInt({ min: 2020, max: 2100 }).withMessage('Valid year is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { month, year } = req.body;
  const db = getDatabase();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  
  const outwardSupplies = db.prepare(`
    SELECT 
      SUM(subtotal) as taxable_value,
      SUM(gst_amount) as total_tax,
      COUNT(*) as invoice_count
    FROM invoices
    WHERE invoice_date >= ? AND invoice_date <= ?
      AND payment_status = 'paid'
  `).get(startDate, endDate);
  
  const gstr3bData = {
    gstin: getSetting('gst_number') || '',
    ret_period: `${String(month).padStart(2, '0')}${year}`,
    sup_details: {
      osup_det: {
        txval: outwardSupplies.taxable_value || 0,
        iamt: 0,
        camt: (outwardSupplies.total_tax || 0) / 2,
        samt: (outwardSupplies.total_tax || 0) / 2,
        csamt: 0
      },
      osup_zero: {
        txval: 0,
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      },
      osup_nil_exmp: {
        txval: 0
      },
      isup_rev: {
        txval: 0,
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      },
      osup_nongst: {
        txval: 0
      }
    },
    itc_elg: {
      itc_avl: [{
        ty: 'IMPG',
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      }],
      itc_rev: [{
        ty: 'RUL',
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      }],
      itc_net: {
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      },
      itc_inelg: [{
        ty: 'RUL',
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      }]
    },
    intr_ltfee: {
      intr_details: {
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      },
      ltfee_details: {
        iamt: 0,
        camt: 0,
        samt: 0,
        csamt: 0
      }
    },
    summary: {
      total_outward_taxable: outwardSupplies.taxable_value || 0,
      total_cgst_payable: (outwardSupplies.total_tax || 0) / 2,
      total_sgst_payable: (outwardSupplies.total_tax || 0) / 2,
      total_igst_payable: 0,
      total_cess_payable: 0,
      net_tax_payable: outwardSupplies.total_tax || 0,
      invoice_count: outwardSupplies.invoice_count || 0
    }
  };
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.EXPORT, 'invoices', null, null, { type: 'GSTR3B', month, year }, req);
  
  res.json({
    success: true,
    message: 'GSTR-3B data generated',
    data: gstr3bData
  });
}));

router.get('/monthly-report', authenticate, [
  query('month').isInt({ min: 1, max: 12 }).toInt(),
  query('year').isInt({ min: 2020, max: 2100 }).toInt()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { month, year } = req.query;
  const db = getDatabase();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  
  const repairStats = db.prepare(`
    SELECT 
      COUNT(*) as total_repairs,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(final_price) as total_revenue,
      SUM(parts_cost) as total_parts_cost,
      SUM(final_price - parts_cost) as gross_profit,
      AVG(final_price) as avg_ticket_value
    FROM repairs
    WHERE created_at >= ? AND created_at <= ?
  `).get(startDate, endDate);
  
  const invoiceStats = db.prepare(`
    SELECT 
      COUNT(*) as total_invoices,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
      SUM(total_amount) as total_invoiced,
      SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_collected,
      SUM(gst_amount) as total_gst
    FROM invoices
    WHERE invoice_date >= ? AND invoice_date <= ?
  `).get(startDate, endDate);
  
  const customerStats = db.prepare(`
    SELECT 
      COUNT(*) as new_customers,
      source,
      COUNT(*) as count
    FROM customers
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY source
  `).all(startDate, endDate);
  
  const serviceBreakdown = db.prepare(`
    SELECT 
      s.category,
      s.name,
      COUNT(r.id) as count,
      SUM(r.final_price) as revenue
    FROM repairs r
    LEFT JOIN services s ON r.service_id = s.id
    WHERE r.created_at >= ? AND r.created_at <= ?
    GROUP BY s.id
    ORDER BY revenue DESC
  `).all(startDate, endDate);
  
  const digitalStats = db.prepare(`
    SELECT 
      COUNT(*) as total_projects,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(total_amount) as total_value
    FROM digital_services
    WHERE created_at >= ? AND created_at <= ?
  `).get(startDate, endDate);
  
  const report = {
    period: {
      month,
      year,
      month_name: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
    },
    repairs: repairStats,
    invoices: invoiceStats,
    customers: {
      new_customers: customerStats.reduce((sum, c) => sum + c.count, 0),
      by_source: customerStats
    },
    services: serviceBreakdown,
    digital_services: digitalStats,
    summary: {
      total_revenue: (repairStats.total_revenue || 0) + (digitalStats.total_value || 0),
      total_profit: repairStats.gross_profit || 0,
      profit_margin: repairStats.total_revenue > 0 
        ? Math.round((repairStats.gross_profit / repairStats.total_revenue) * 100) 
        : 0,
      collection_rate: invoiceStats.total_invoiced > 0
        ? Math.round((invoiceStats.total_collected / invoiceStats.total_invoiced) * 100)
        : 0
    }
  };
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.VIEW, 'reports', null, null, { type: 'monthly', month, year }, req);
  
  res.json({
    success: true,
    data: report
  });
}));

module.exports = router;
