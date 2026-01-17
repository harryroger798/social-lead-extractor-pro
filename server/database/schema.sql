-- ByteWorld Management System Database Schema
-- SQLite Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'technician' CHECK(role IN ('admin', 'technician', 'viewer')),
  is_active INTEGER DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT DEFAULT 'Barrackpore',
  gst_number TEXT,
  business_type TEXT CHECK(business_type IN ('individual', 'business', 'coaching', 'clinic', 'other')),
  source TEXT CHECK(source IN ('GMB', 'Facebook', 'Referral', 'Email', 'JustDial', 'Walk-in', 'Other')),
  notes TEXT,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  repair_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_to_airtable INTEGER DEFAULT 0,
  airtable_id TEXT
);

-- Services table (pricing catalog)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('PC_REPAIR', 'MOBILE_REPAIR', 'DIGITAL_SERVICE')),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  profit_margin DECIMAL(5, 2),
  estimated_hours INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repairs table (main business activity)
CREATE TABLE IF NOT EXISTS repairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  service_id INTEGER,
  device_type TEXT CHECK(device_type IN ('LAPTOP', 'PC', 'MOBILE', 'TABLET', 'OTHER')),
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  issue_description TEXT NOT NULL,
  diagnosis TEXT,
  parts_cost DECIMAL(10, 2) DEFAULT 0,
  labor_cost DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  gst_amount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'diagnosis_done', 'repair_done', 'ready_pickup', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  turnaround_hours INTEGER,
  started_at DATETIME,
  estimated_completion DATETIME,
  completed_at DATETIME,
  warranty_days INTEGER DEFAULT 30,
  warranty_expiry DATETIME,
  notes TEXT,
  before_photos TEXT,
  after_photos TEXT,
  assigned_to INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_to_airtable INTEGER DEFAULT 0,
  airtable_id TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Mobile repairs specific (track software vs hardware)
CREATE TABLE IF NOT EXISTS mobile_repairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repair_id INTEGER UNIQUE NOT NULL,
  phone_model TEXT,
  imei_number TEXT,
  repair_type TEXT CHECK(repair_type IN ('SOFTWARE', 'HARDWARE', 'BOTH')),
  parts_replaced TEXT,
  parts_supplier TEXT,
  parts_cost DECIMAL(10, 2) DEFAULT 0,
  software_issues TEXT,
  hardware_issues TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE
);

-- Digital services (projects)
CREATE TABLE IF NOT EXISTS digital_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  service_type TEXT CHECK(service_type IN ('WEBSITE', 'SEO', 'SOCIAL_MEDIA', 'CUSTOM', 'MAINTENANCE')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'proposal' CHECK(status IN ('proposal', 'signed', 'in_progress', 'review', 'completed', 'cancelled')),
  amount DECIMAL(10, 2) DEFAULT 0,
  gst_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  is_retainer INTEGER DEFAULT 0,
  retainer_amount DECIMAL(10, 2),
  retainer_frequency TEXT CHECK(retainer_frequency IN ('monthly', 'quarterly', 'yearly')),
  deliverables TEXT,
  milestones TEXT,
  started_at DATETIME,
  due_date DATETIME,
  completed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_to_airtable INTEGER DEFAULT 0,
  airtable_id TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  repair_id INTEGER,
  digital_service_id INTEGER,
  invoice_type TEXT DEFAULT 'repair' CHECK(invoice_type IN ('repair', 'digital_service', 'product', 'other')),
  subtotal DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  gst_rate DECIMAL(5, 2) DEFAULT 18,
  gst_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  gst_registered INTEGER DEFAULT 0,
  gst_number TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'partial', 'paid', 'overdue', 'refunded')),
  payment_method TEXT CHECK(payment_method IN ('cash', 'gpay', 'paytm', 'bank_transfer', 'cheque', 'card', 'other')),
  payment_date DATETIME,
  invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME,
  notes TEXT,
  terms TEXT DEFAULT 'Warranty: 30 days on parts and labor. Payment due within 7 days.',
  email_sent INTEGER DEFAULT 0,
  email_sent_at DATETIME,
  sms_sent INTEGER DEFAULT 0,
  sms_sent_at DATETIME,
  pdf_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_to_airtable INTEGER DEFAULT 0,
  airtable_id TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (repair_id) REFERENCES repairs(id),
  FOREIGN KEY (digital_service_id) REFERENCES digital_services(id)
);

-- Payments tracking
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK(payment_method IN ('cash', 'gpay', 'paytm', 'bank_transfer', 'cheque', 'card', 'other')),
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  reference_number TEXT,
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Settings table (business details)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_secret INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Sync history (track Airtable syncs)
CREATE TABLE IF NOT EXISTS sync_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity log (audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'sync')),
  table_name TEXT,
  record_id INTEGER,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Omnisend log (email/SMS tracking)
CREATE TABLE IF NOT EXISTS omnisend_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER,
  customer_id INTEGER,
  message_type TEXT CHECK(message_type IN ('email', 'sms', 'whatsapp')),
  recipient TEXT,
  subject TEXT,
  body TEXT,
  template_id TEXT,
  status TEXT CHECK(status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
  omnisend_id TEXT,
  error_message TEXT,
  sent_at DATETIME,
  delivered_at DATETIME,
  opened_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Backups table
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  backup_type TEXT CHECK(backup_type IN ('auto', 'manual', 'scheduled')),
  tables_included TEXT,
  records_count INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Phone models database for quick quotes
CREATE TABLE IF NOT EXISTS phone_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  screen_price DECIMAL(10, 2),
  battery_price DECIMAL(10, 2),
  charging_port_price DECIMAL(10, 2),
  back_panel_price DECIMAL(10, 2),
  software_price DECIMAL(10, 2) DEFAULT 500,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);
CREATE INDEX IF NOT EXISTS idx_repairs_customer ON repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_created ON repairs(created_at);
CREATE INDEX IF NOT EXISTS idx_repairs_invoice_number ON repairs(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_digital_services_customer ON digital_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_digital_services_status ON digital_services(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_table ON activity_log(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_history_table ON sync_history(table_name);
CREATE INDEX IF NOT EXISTS idx_omnisend_log_invoice ON omnisend_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
