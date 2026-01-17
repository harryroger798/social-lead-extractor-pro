const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db = null;

function getDatabase() {
  if (db) return db;
  
  db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'development' ? console.log : null });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  return db;
}

function initializeDatabase() {
  const database = getDatabase();
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        database.exec(statement + ';');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', error.message);
        }
      }
    }
  }
  
  initializeDefaultSettings(database);
  initializeDefaultServices(database);
  initializePhoneModels(database);
  
  console.log('Database initialized successfully');
  return database;
}

function initializeDefaultSettings(database) {
  const defaultSettings = [
    { key: 'business_name', value: process.env.BUSINESS_NAME || 'ByteCare', category: 'business', description: 'Business name' },
    { key: 'owner_name', value: process.env.OWNER_NAME || 'Sayan Roy Chowdhury', category: 'business', description: 'Owner name' },
    { key: 'business_phone', value: process.env.BUSINESS_PHONE || '', category: 'business', description: 'Business phone number' },
    { key: 'business_email', value: process.env.BUSINESS_EMAIL || 'harryroger798@gmail.com', category: 'business', description: 'Business email' },
    { key: 'business_address', value: process.env.BUSINESS_ADDRESS || '', category: 'business', description: 'Business address' },
    { key: 'business_city', value: process.env.BUSINESS_CITY || 'Barrackpore', category: 'business', description: 'Business city' },
    { key: 'gst_number', value: '', category: 'tax', description: 'GST registration number' },
    { key: 'gst_registered', value: '0', category: 'tax', description: 'GST registration status' },
    { key: 'gst_rate', value: '18', category: 'tax', description: 'Default GST rate' },
    { key: 'bank_account', value: '', category: 'payment', description: 'Bank account number' },
    { key: 'bank_name', value: '', category: 'payment', description: 'Bank name' },
    { key: 'bank_ifsc', value: '', category: 'payment', description: 'Bank IFSC code' },
    { key: 'upi_id', value: process.env.GOOGLE_PAY_UPI_ID || '7003888936@ptyes', category: 'payment', description: 'Google Pay UPI ID' },
    { key: 'warranty_days', value: '30', category: 'service', description: 'Default warranty days' },
    { key: 'logo_url', value: '', category: 'branding', description: 'Business logo URL' },
    { key: 'theme_color', value: '#0284C7', category: 'branding', description: 'Primary theme color' },
    { key: 'invoice_prefix', value: new Date().getFullYear().toString(), category: 'invoice', description: 'Invoice number prefix' },
    { key: 'invoice_counter', value: '0', category: 'invoice', description: 'Invoice counter' },
    { key: 'project_prefix', value: 'DS', category: 'invoice', description: 'Digital service project prefix' },
    { key: 'project_counter', value: '0', category: 'invoice', description: 'Project counter' },
    { key: 'airtable_api_key', value: process.env.AIRTABLE_API_KEY || '', category: 'integration', description: 'Airtable API key', is_secret: 1 },
    { key: 'airtable_base_id', value: process.env.AIRTABLE_BASE_ID || '', category: 'integration', description: 'Airtable base ID' },
    { key: 'airtable_sync_enabled', value: '1', category: 'integration', description: 'Enable Airtable sync' },
    { key: 'airtable_sync_interval', value: '30', category: 'integration', description: 'Airtable sync interval in minutes' },
    { key: 'omnisend_api_key', value: process.env.OMNISEND_API_KEY || '', category: 'integration', description: 'Omnisend API key', is_secret: 1 },
    { key: 'omnisend_enabled', value: '1', category: 'integration', description: 'Enable Omnisend integration' },
    { key: 'auto_send_invoice_email', value: '1', category: 'notification', description: 'Auto send invoice via email' },
    { key: 'auto_send_invoice_sms', value: '0', category: 'notification', description: 'Auto send invoice via SMS' },
    { key: 'payment_reminder_days', value: '3', category: 'notification', description: 'Days before payment reminder' },
    { key: 'auto_backup_enabled', value: '1', category: 'backup', description: 'Enable auto backup' },
    { key: 'auto_backup_time', value: '00:00', category: 'backup', description: 'Auto backup time' },
    { key: 'backup_retention_days', value: '30', category: 'backup', description: 'Backup retention days' }
  ];

  const insertStmt = database.prepare(`
    INSERT OR IGNORE INTO settings (key, value, category, description, is_secret)
    VALUES (@key, @value, @category, @description, @is_secret)
  `);

  for (const setting of defaultSettings) {
    insertStmt.run({
      key: setting.key,
      value: setting.value,
      category: setting.category,
      description: setting.description,
      is_secret: setting.is_secret || 0
    });
  }
}

function initializeDefaultServices(database) {
  const defaultServices = [
    { category: 'PC_REPAIR', name: 'Windows Installation', description: 'Fresh Windows OS installation with drivers', price: 800, min_price: 800, max_price: 1500, profit_margin: 85, estimated_hours: 2 },
    { category: 'PC_REPAIR', name: 'Virus Removal', description: 'Complete virus and malware removal', price: 500, min_price: 500, max_price: 1200, profit_margin: 90, estimated_hours: 1 },
    { category: 'PC_REPAIR', name: 'Data Recovery', description: 'Recover data from damaged drives', price: 1500, min_price: 1500, max_price: 5000, profit_margin: 80, estimated_hours: 4 },
    { category: 'PC_REPAIR', name: 'Hardware Repair', description: 'General hardware repair and replacement', price: 500, min_price: 500, max_price: 3000, profit_margin: 60, estimated_hours: 2 },
    { category: 'PC_REPAIR', name: 'RAM Upgrade', description: 'RAM installation and upgrade', price: 300, min_price: 300, max_price: 500, profit_margin: 50, estimated_hours: 1 },
    { category: 'PC_REPAIR', name: 'SSD Upgrade', description: 'SSD installation with data migration', price: 500, min_price: 500, max_price: 1000, profit_margin: 50, estimated_hours: 2 },
    { category: 'PC_REPAIR', name: 'Laptop Screen Replacement', description: 'Replace damaged laptop screen', price: 2000, min_price: 2000, max_price: 8000, profit_margin: 40, estimated_hours: 2 },
    { category: 'PC_REPAIR', name: 'Keyboard Replacement', description: 'Laptop keyboard replacement', price: 800, min_price: 800, max_price: 2500, profit_margin: 45, estimated_hours: 1 },
    { category: 'PC_REPAIR', name: 'Motherboard Repair', description: 'Motherboard diagnosis and repair', price: 1500, min_price: 1500, max_price: 5000, profit_margin: 55, estimated_hours: 4 },
    { category: 'PC_REPAIR', name: 'Thermal Paste Application', description: 'CPU/GPU thermal paste replacement', price: 400, min_price: 400, max_price: 600, profit_margin: 85, estimated_hours: 1 },
    { category: 'MOBILE_REPAIR', name: 'Software Repair', description: 'Software issues, OS reinstall, factory reset', price: 500, min_price: 500, max_price: 1000, profit_margin: 95, estimated_hours: 1 },
    { category: 'MOBILE_REPAIR', name: 'Screen Replacement', description: 'Mobile screen replacement', price: 1500, min_price: 1500, max_price: 5000, profit_margin: 35, estimated_hours: 1 },
    { category: 'MOBILE_REPAIR', name: 'Battery Replacement', description: 'Mobile battery replacement', price: 800, min_price: 800, max_price: 2000, profit_margin: 40, estimated_hours: 1 },
    { category: 'MOBILE_REPAIR', name: 'Charging Port Repair', description: 'Charging port replacement', price: 600, min_price: 600, max_price: 1500, profit_margin: 50, estimated_hours: 1 },
    { category: 'MOBILE_REPAIR', name: 'Back Panel Replacement', description: 'Back glass/panel replacement', price: 800, min_price: 800, max_price: 2500, profit_margin: 40, estimated_hours: 1 },
    { category: 'MOBILE_REPAIR', name: 'Water Damage Repair', description: 'Water damage diagnosis and repair', price: 1000, min_price: 1000, max_price: 3000, profit_margin: 60, estimated_hours: 2 },
    { category: 'DIGITAL_SERVICE', name: 'Basic Website', description: '5-page responsive website', price: 25000, min_price: 25000, max_price: 50000, profit_margin: 70, estimated_hours: 40 },
    { category: 'DIGITAL_SERVICE', name: 'E-commerce Website', description: 'Full e-commerce website with payment', price: 50000, min_price: 50000, max_price: 100000, profit_margin: 65, estimated_hours: 80 },
    { category: 'DIGITAL_SERVICE', name: 'SEO Monthly', description: 'Monthly SEO optimization package', price: 15000, min_price: 15000, max_price: 25000, profit_margin: 75, estimated_hours: 20 },
    { category: 'DIGITAL_SERVICE', name: 'Social Media Management', description: 'Monthly social media management', price: 10000, min_price: 10000, max_price: 20000, profit_margin: 70, estimated_hours: 15 },
    { category: 'DIGITAL_SERVICE', name: 'Google Ads Management', description: 'Monthly Google Ads campaign management', price: 8000, min_price: 8000, max_price: 15000, profit_margin: 65, estimated_hours: 10 },
    { category: 'DIGITAL_SERVICE', name: 'Website Maintenance', description: 'Monthly website maintenance and updates', price: 5000, min_price: 5000, max_price: 10000, profit_margin: 80, estimated_hours: 5 }
  ];

  const insertStmt = database.prepare(`
    INSERT OR IGNORE INTO services (category, name, description, price, min_price, max_price, profit_margin, estimated_hours)
    VALUES (@category, @name, @description, @price, @min_price, @max_price, @profit_margin, @estimated_hours)
  `);

  for (const service of defaultServices) {
    insertStmt.run(service);
  }
}

function initializePhoneModels(database) {
  const phoneModels = [
    { brand: 'Apple', model: 'iPhone 15 Pro Max', screen_price: 8000, battery_price: 2500, charging_port_price: 1500, back_panel_price: 3000 },
    { brand: 'Apple', model: 'iPhone 15 Pro', screen_price: 7500, battery_price: 2500, charging_port_price: 1500, back_panel_price: 2800 },
    { brand: 'Apple', model: 'iPhone 15', screen_price: 6000, battery_price: 2000, charging_port_price: 1200, back_panel_price: 2500 },
    { brand: 'Apple', model: 'iPhone 14 Pro Max', screen_price: 7000, battery_price: 2200, charging_port_price: 1400, back_panel_price: 2800 },
    { brand: 'Apple', model: 'iPhone 14 Pro', screen_price: 6500, battery_price: 2200, charging_port_price: 1400, back_panel_price: 2600 },
    { brand: 'Apple', model: 'iPhone 14', screen_price: 5500, battery_price: 1800, charging_port_price: 1200, back_panel_price: 2200 },
    { brand: 'Apple', model: 'iPhone 13 Pro Max', screen_price: 6000, battery_price: 2000, charging_port_price: 1200, back_panel_price: 2500 },
    { brand: 'Apple', model: 'iPhone 13 Pro', screen_price: 5500, battery_price: 2000, charging_port_price: 1200, back_panel_price: 2300 },
    { brand: 'Apple', model: 'iPhone 13', screen_price: 4500, battery_price: 1600, charging_port_price: 1000, back_panel_price: 2000 },
    { brand: 'Apple', model: 'iPhone 12 Pro Max', screen_price: 5000, battery_price: 1800, charging_port_price: 1000, back_panel_price: 2200 },
    { brand: 'Apple', model: 'iPhone 12 Pro', screen_price: 4500, battery_price: 1800, charging_port_price: 1000, back_panel_price: 2000 },
    { brand: 'Apple', model: 'iPhone 12', screen_price: 4000, battery_price: 1500, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Apple', model: 'iPhone 11 Pro Max', screen_price: 4500, battery_price: 1600, charging_port_price: 900, back_panel_price: 2000 },
    { brand: 'Apple', model: 'iPhone 11 Pro', screen_price: 4000, battery_price: 1600, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Apple', model: 'iPhone 11', screen_price: 2500, battery_price: 1400, charging_port_price: 800, back_panel_price: 1500 },
    { brand: 'Apple', model: 'iPhone XS Max', screen_price: 3500, battery_price: 1400, charging_port_price: 800, back_panel_price: 1600 },
    { brand: 'Apple', model: 'iPhone XS', screen_price: 3000, battery_price: 1400, charging_port_price: 800, back_panel_price: 1400 },
    { brand: 'Apple', model: 'iPhone XR', screen_price: 2500, battery_price: 1200, charging_port_price: 700, back_panel_price: 1200 },
    { brand: 'Apple', model: 'iPhone X', screen_price: 2800, battery_price: 1200, charging_port_price: 700, back_panel_price: 1300 },
    { brand: 'Apple', model: 'iPhone SE (2022)', screen_price: 2000, battery_price: 1000, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Samsung', model: 'Galaxy S24 Ultra', screen_price: 7000, battery_price: 2200, charging_port_price: 1200, back_panel_price: 2500 },
    { brand: 'Samsung', model: 'Galaxy S24+', screen_price: 5500, battery_price: 2000, charging_port_price: 1000, back_panel_price: 2000 },
    { brand: 'Samsung', model: 'Galaxy S24', screen_price: 4500, battery_price: 1800, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Samsung', model: 'Galaxy S23 Ultra', screen_price: 6500, battery_price: 2000, charging_port_price: 1100, back_panel_price: 2300 },
    { brand: 'Samsung', model: 'Galaxy S23+', screen_price: 5000, battery_price: 1800, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Samsung', model: 'Galaxy S23', screen_price: 4000, battery_price: 1600, charging_port_price: 800, back_panel_price: 1600 },
    { brand: 'Samsung', model: 'Galaxy S22 Ultra', screen_price: 5500, battery_price: 1800, charging_port_price: 1000, back_panel_price: 2000 },
    { brand: 'Samsung', model: 'Galaxy S22+', screen_price: 4500, battery_price: 1600, charging_port_price: 800, back_panel_price: 1600 },
    { brand: 'Samsung', model: 'Galaxy S22', screen_price: 3500, battery_price: 1400, charging_port_price: 700, back_panel_price: 1400 },
    { brand: 'Samsung', model: 'Galaxy S21 Ultra', screen_price: 5000, battery_price: 1600, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Samsung', model: 'Galaxy A54', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Samsung', model: 'Galaxy A34', screen_price: 2000, battery_price: 1000, charging_port_price: 500, back_panel_price: 800 },
    { brand: 'Samsung', model: 'Galaxy M54', screen_price: 2200, battery_price: 1100, charging_port_price: 550, back_panel_price: 900 },
    { brand: 'OnePlus', model: 'OnePlus 12', screen_price: 5000, battery_price: 1800, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'OnePlus', model: 'OnePlus 11', screen_price: 4500, battery_price: 1600, charging_port_price: 800, back_panel_price: 1600 },
    { brand: 'OnePlus', model: 'OnePlus 10 Pro', screen_price: 4000, battery_price: 1500, charging_port_price: 750, back_panel_price: 1500 },
    { brand: 'OnePlus', model: 'OnePlus Nord 3', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'OnePlus', model: 'OnePlus Nord CE 3', screen_price: 2000, battery_price: 1000, charging_port_price: 500, back_panel_price: 800 },
    { brand: 'Xiaomi', model: 'Xiaomi 14 Pro', screen_price: 4500, battery_price: 1600, charging_port_price: 800, back_panel_price: 1500 },
    { brand: 'Xiaomi', model: 'Xiaomi 14', screen_price: 4000, battery_price: 1500, charging_port_price: 750, back_panel_price: 1400 },
    { brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', screen_price: 2000, battery_price: 1000, charging_port_price: 500, back_panel_price: 800 },
    { brand: 'Xiaomi', model: 'Redmi Note 12 Pro+', screen_price: 2200, battery_price: 1100, charging_port_price: 550, back_panel_price: 900 },
    { brand: 'Xiaomi', model: 'POCO F5', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Xiaomi', model: 'POCO X5 Pro', screen_price: 2000, battery_price: 1000, charging_port_price: 500, back_panel_price: 800 },
    { brand: 'Vivo', model: 'Vivo X100 Pro', screen_price: 4500, battery_price: 1600, charging_port_price: 800, back_panel_price: 1500 },
    { brand: 'Vivo', model: 'Vivo V29 Pro', screen_price: 3000, battery_price: 1300, charging_port_price: 650, back_panel_price: 1200 },
    { brand: 'Vivo', model: 'Vivo V29', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Oppo', model: 'Oppo Find X7 Ultra', screen_price: 5000, battery_price: 1800, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Oppo', model: 'Oppo Reno 11 Pro', screen_price: 3000, battery_price: 1300, charging_port_price: 650, back_panel_price: 1200 },
    { brand: 'Oppo', model: 'Oppo Reno 11', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Realme', model: 'Realme GT 5 Pro', screen_price: 3500, battery_price: 1400, charging_port_price: 700, back_panel_price: 1300 },
    { brand: 'Realme', model: 'Realme 12 Pro+', screen_price: 2500, battery_price: 1200, charging_port_price: 600, back_panel_price: 1000 },
    { brand: 'Realme', model: 'Realme Narzo 60 Pro', screen_price: 2000, battery_price: 1000, charging_port_price: 500, back_panel_price: 800 },
    { brand: 'Google', model: 'Pixel 8 Pro', screen_price: 5000, battery_price: 1800, charging_port_price: 900, back_panel_price: 1800 },
    { brand: 'Google', model: 'Pixel 8', screen_price: 4000, battery_price: 1500, charging_port_price: 750, back_panel_price: 1500 },
    { brand: 'Google', model: 'Pixel 7 Pro', screen_price: 4500, battery_price: 1600, charging_port_price: 800, back_panel_price: 1600 },
    { brand: 'Google', model: 'Pixel 7', screen_price: 3500, battery_price: 1400, charging_port_price: 700, back_panel_price: 1400 }
  ];

  const insertStmt = database.prepare(`
    INSERT OR IGNORE INTO phone_models (brand, model, screen_price, battery_price, charging_port_price, back_panel_price)
    VALUES (@brand, @model, @screen_price, @battery_price, @charging_port_price, @back_panel_price)
  `);

  for (const phone of phoneModels) {
    insertStmt.run(phone);
  }
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function getSetting(key) {
  const database = getDatabase();
  const stmt = database.prepare('SELECT value FROM settings WHERE key = ?');
  const result = stmt.get(key);
  return result ? result.value : null;
}

function setSetting(key, value, userId = null) {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
    WHERE key = ?
  `);
  return stmt.run(value, userId, key);
}

function getNextInvoiceNumber() {
  const database = getDatabase();
  const prefix = getSetting('invoice_prefix') || new Date().getFullYear().toString();
  
  const updateStmt = database.prepare(`
    UPDATE settings SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT)
    WHERE key = 'invoice_counter'
  `);
  updateStmt.run();
  
  const counter = getSetting('invoice_counter');
  return `${prefix}-${String(counter).padStart(3, '0')}`;
}

function getNextProjectId() {
  const database = getDatabase();
  const prefix = getSetting('project_prefix') || 'DS';
  
  const updateStmt = database.prepare(`
    UPDATE settings SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT)
    WHERE key = 'project_counter'
  `);
  updateStmt.run();
  
  const counter = getSetting('project_counter');
  return `${prefix}-${String(counter).padStart(3, '0')}`;
}

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  getSetting,
  setSetting,
  getNextInvoiceNumber,
  getNextProjectId
};
