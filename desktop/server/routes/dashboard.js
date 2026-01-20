const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDatabase } = require('../database/db');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');
const { REPAIR_STATUS, PAYMENT_STATUS } = require('../config/constants');

const router = express.Router();

router.get('/overview', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();
  
  const todayStats = db.prepare(`
    SELECT 
      COUNT(*) as repairs_count,
      COALESCE(SUM(final_price), 0) as revenue
    FROM repairs
    WHERE status = 'completed' AND DATE(completed_at) = DATE('now')
  `).get();
  
  const weekStats = db.prepare(`
    SELECT 
      COUNT(*) as repairs_count,
      COALESCE(SUM(final_price), 0) as revenue
    FROM repairs
    WHERE status = 'completed' AND completed_at >= ?
  `).get(weekAgoStr);
  
  const monthStats = db.prepare(`
    SELECT 
      COUNT(*) as repairs_count,
      COALESCE(SUM(final_price), 0) as revenue,
      COALESCE(SUM(final_price - parts_cost), 0) as profit
    FROM repairs
    WHERE status = 'completed' AND completed_at >= ?
  `).get(monthStartStr);
  
  const pendingPayments = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as total
    FROM invoices
    WHERE payment_status IN ('unpaid', 'partial', 'overdue')
  `).get();
  
  const avgTurnaround = db.prepare(`
    SELECT AVG(
      CAST((julianday(completed_at) - julianday(created_at)) * 24 AS INTEGER)
    ) as avg_hours
    FROM repairs
    WHERE status = 'completed' AND completed_at IS NOT NULL
  `).get();
  
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  const repeatCustomers = db.prepare('SELECT COUNT(*) as count FROM customers WHERE repair_count > 1').get();
  
  const activeRepairs = db.prepare(`
    SELECT COUNT(*) as count FROM repairs
    WHERE status NOT IN ('completed', 'cancelled')
  `).get();
  
  const overdueInvoices = db.prepare(`
    SELECT COUNT(*) as count FROM invoices
    WHERE payment_status = 'overdue' OR (payment_status IN ('unpaid', 'partial') AND due_date < datetime('now'))
  `).get();
  
  res.json({
    success: true,
    data: {
      today_revenue: todayStats.revenue,
      today_repairs: todayStats.repairs_count,
      week_revenue: weekStats.revenue,
      week_repairs: weekStats.repairs_count,
      month_revenue: monthStats.revenue,
      month_repairs: monthStats.repairs_count,
      month_profit: monthStats.profit,
      pending_payments: pendingPayments.total,
      average_turnaround_hours: Math.round(avgTurnaround.avg_hours || 0),
      total_customers: totalCustomers.count,
      repeat_customers: repeatCustomers.count,
      repeat_customer_rate: totalCustomers.count > 0 ? Math.round((repeatCustomers.count / totalCustomers.count) * 100) : 0,
      active_repairs: activeRepairs.count,
      overdue_invoices: overdueInvoices.count
    }
  });
}));

router.get('/revenue-chart', authenticate, [
  query('period').optional().isIn(['week', 'month', 'year'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { period = 'month' } = req.query;
  const db = getDatabase();
  
  let query;
  let dateFormat;
  let startDate;
  
  const now = new Date();
  
  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      dateFormat = '%Y-%m-%d';
      query = `
        SELECT 
          strftime('${dateFormat}', completed_at) as date,
          COUNT(*) as repairs,
          COALESCE(SUM(final_price), 0) as revenue,
          COALESCE(SUM(final_price - parts_cost), 0) as profit
        FROM repairs
        WHERE status = 'completed' AND completed_at >= ?
        GROUP BY strftime('${dateFormat}', completed_at)
        ORDER BY date
      `;
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      dateFormat = '%Y-%m';
      query = `
        SELECT 
          strftime('${dateFormat}', completed_at) as date,
          COUNT(*) as repairs,
          COALESCE(SUM(final_price), 0) as revenue,
          COALESCE(SUM(final_price - parts_cost), 0) as profit
        FROM repairs
        WHERE status = 'completed' AND completed_at >= ?
        GROUP BY strftime('${dateFormat}', completed_at)
        ORDER BY date
      `;
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFormat = '%Y-%m-%d';
      query = `
        SELECT 
          strftime('${dateFormat}', completed_at) as date,
          COUNT(*) as repairs,
          COALESCE(SUM(final_price), 0) as revenue,
          COALESCE(SUM(final_price - parts_cost), 0) as profit
        FROM repairs
        WHERE status = 'completed' AND completed_at >= ?
        GROUP BY strftime('${dateFormat}', completed_at)
        ORDER BY date
      `;
  }
  
  const data = db.prepare(query).all(startDate.toISOString());
  
  res.json({
    success: true,
    data,
    period,
    start_date: startDate.toISOString()
  });
}));

router.get('/repair-status', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM repairs
    GROUP BY status
  `).all();
  
  const result = {};
  Object.values(REPAIR_STATUS).forEach(status => {
    result[status] = 0;
  });
  
  statusCounts.forEach(item => {
    result[item.status] = item.count;
  });
  
  const total = Object.values(result).reduce((sum, count) => sum + count, 0);
  
  res.json({
    success: true,
    data: result,
    total
  });
}));

router.get('/top-services', authenticate, [
  query('limit').optional().isInt({ min: 1, max: 20 }).toInt()
], asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const db = getDatabase();
  
  const topServices = db.prepare(`
    SELECT 
      s.id,
      s.name,
      s.category,
      COUNT(r.id) as repair_count,
      COALESCE(SUM(r.final_price), 0) as total_revenue,
      COALESCE(AVG(r.final_price), 0) as avg_revenue
    FROM services s
    LEFT JOIN repairs r ON s.id = r.service_id AND r.status = 'completed'
    GROUP BY s.id
    HAVING repair_count > 0
    ORDER BY total_revenue DESC
    LIMIT ?
  `).all(limit);
  
  res.json({
    success: true,
    data: topServices
  });
}));

router.get('/customer-acquisition', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const acquisitionBySource = db.prepare(`
    SELECT 
      COALESCE(source, 'Unknown') as source,
      COUNT(*) as count,
      COALESCE(SUM(total_spent), 0) as total_revenue
    FROM customers
    GROUP BY source
    ORDER BY count DESC
  `).all();
  
  const monthlyAcquisition = db.prepare(`
    SELECT 
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as new_customers
    FROM customers
    WHERE created_at >= datetime('now', '-12 months')
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month
  `).all();
  
  res.json({
    success: true,
    data: {
      by_source: acquisitionBySource,
      monthly: monthlyAcquisition
    }
  });
}));

router.get('/recent-repairs', authenticate, [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const db = getDatabase();
  
  const recentRepairs = db.prepare(`
    SELECT 
      r.*,
      c.name as customer_name,
      c.phone as customer_phone,
      s.name as service_name
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN services s ON r.service_id = s.id
    ORDER BY r.created_at DESC
    LIMIT ?
  `).all(limit);
  
  res.json({
    success: true,
    data: recentRepairs
  });
}));

router.get('/recent-invoices', authenticate, [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const db = getDatabase();
  
  const recentInvoices = db.prepare(`
    SELECT 
      i.*,
      c.name as customer_name,
      c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.invoice_date DESC
    LIMIT ?
  `).all(limit);
  
  res.json({
    success: true,
    data: recentInvoices
  });
}));

router.get('/alerts', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const overdueRepairs = db.prepare(`
    SELECT COUNT(*) as count FROM repairs
    WHERE status NOT IN ('completed', 'cancelled')
      AND estimated_completion IS NOT NULL
      AND estimated_completion < datetime('now')
  `).get();
  
  const overdueInvoices = db.prepare(`
    SELECT COUNT(*) as count FROM invoices
    WHERE payment_status IN ('unpaid', 'partial')
      AND due_date < datetime('now')
  `).get();
  
  const urgentRepairs = db.prepare(`
    SELECT COUNT(*) as count FROM repairs
    WHERE priority = 'urgent' AND status NOT IN ('completed', 'cancelled')
  `).get();
  
  const lowStockAlerts = 0;
  
  const warrantyExpiring = db.prepare(`
    SELECT COUNT(*) as count FROM repairs
    WHERE status = 'completed'
      AND warranty_expiry IS NOT NULL
      AND warranty_expiry BETWEEN datetime('now') AND datetime('now', '+7 days')
  `).get();
  
  res.json({
    success: true,
    data: {
      overdue_repairs: overdueRepairs.count,
      overdue_invoices: overdueInvoices.count,
      urgent_repairs: urgentRepairs.count,
      low_stock_alerts: lowStockAlerts,
      warranty_expiring_soon: warrantyExpiring.count,
      total_alerts: overdueRepairs.count + overdueInvoices.count + urgentRepairs.count + warrantyExpiring.count
    }
  });
}));

router.get('/service-breakdown', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const breakdown = db.prepare(`
    SELECT 
      s.category,
      COUNT(r.id) as repair_count,
      COALESCE(SUM(r.final_price), 0) as total_revenue,
      COALESCE(SUM(r.final_price - r.parts_cost), 0) as total_profit,
      COALESCE(AVG(r.final_price), 0) as avg_ticket_value
    FROM services s
    LEFT JOIN repairs r ON s.id = r.service_id AND r.status = 'completed'
    GROUP BY s.category
  `).all();
  
  const digitalServices = db.prepare(`
    SELECT 
      service_type as category,
      COUNT(*) as project_count,
      COALESCE(SUM(total_amount), 0) as total_revenue
    FROM digital_services
    WHERE status = 'completed'
    GROUP BY service_type
  `).all();
  
  res.json({
    success: true,
    data: {
      repairs: breakdown,
      digital_services: digitalServices
    }
  });
}));

router.get('/profit-margin', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const monthlyMargins = db.prepare(`
    SELECT 
      strftime('%Y-%m', completed_at) as month,
      COALESCE(SUM(final_price), 0) as revenue,
      COALESCE(SUM(parts_cost), 0) as costs,
      COALESCE(SUM(final_price - parts_cost), 0) as profit,
      CASE 
        WHEN SUM(final_price) > 0 
        THEN ROUND((SUM(final_price - parts_cost) / SUM(final_price)) * 100, 2)
        ELSE 0 
      END as margin_percent
    FROM repairs
    WHERE status = 'completed' AND completed_at >= datetime('now', '-12 months')
    GROUP BY strftime('%Y-%m', completed_at)
    ORDER BY month
  `).all();
  
  res.json({
    success: true,
    data: monthlyMargins
  });
}));

module.exports = router;
