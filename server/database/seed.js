const bcrypt = require('bcryptjs');
const { getDatabase, initializeDatabase, getNextInvoiceNumber, getNextProjectId } = require('./db');

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  initializeDatabase();
  const db = getDatabase();
  
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('007JamesBond@@', 12);
  
  try {
    db.prepare(`
      INSERT OR IGNORE INTO users (username, email, password_hash, role, is_active)
      VALUES ('admin', 'harryroger798@gmail.com', ?, 'admin', 1)
    `).run(adminPassword);
    console.log('Admin user created: admin / 007JamesBond@@');
  } catch (error) {
    console.log('Admin user already exists');
  }
  
  const techPassword = await bcrypt.hash('Tech@123', 12);
  try {
    db.prepare(`
      INSERT OR IGNORE INTO users (username, email, password_hash, role, is_active)
      VALUES ('technician', 'tech@bytecare.com', ?, 'technician', 1)
    `).run(techPassword);
    console.log('Technician user created: technician / Tech@123');
  } catch (error) {
    console.log('Technician user already exists');
  }
  
  console.log('Creating sample customers...');
  const customers = [
    { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@gmail.com', address: '123 Park Street', city: 'Kolkata', source: 'Walk-in', business_type: 'individual' },
    { name: 'Priya Patel', phone: '9876543211', email: 'priya.patel@gmail.com', address: '456 MG Road', city: 'Barrackpore', source: 'Referral', business_type: 'individual' },
    { name: 'Tech Solutions Pvt Ltd', phone: '9876543212', email: 'contact@techsolutions.com', address: '789 IT Park', city: 'Salt Lake', source: 'GMB', business_type: 'business', gst_number: '19AABCT1234A1Z5' },
    { name: 'Amit Kumar', phone: '9876543213', email: 'amit.kumar@yahoo.com', address: '321 Lake Town', city: 'Kolkata', source: 'Facebook', business_type: 'individual' },
    { name: 'Sneha Gupta', phone: '9876543214', email: 'sneha.gupta@hotmail.com', address: '654 New Town', city: 'Rajarhat', source: 'Walk-in', business_type: 'individual' },
    { name: 'Digital Dreams Agency', phone: '9876543215', email: 'info@digitaldreams.in', address: '987 Sector V', city: 'Salt Lake', source: 'GMB', business_type: 'business', gst_number: '19AABCD5678B2Z6' },
    { name: 'Vikram Singh', phone: '9876543216', email: 'vikram.singh@gmail.com', address: '147 Dum Dum', city: 'Kolkata', source: 'Referral', business_type: 'individual' },
    { name: 'Ananya Das', phone: '9876543217', email: 'ananya.das@gmail.com', address: '258 Howrah', city: 'Howrah', source: 'Walk-in', business_type: 'individual' },
    { name: 'StartUp Hub', phone: '9876543218', email: 'hello@startuphub.co', address: '369 Eco Park', city: 'New Town', source: 'Facebook', business_type: 'business' },
    { name: 'Rajesh Banerjee', phone: '9876543219', email: 'rajesh.b@gmail.com', address: '741 Jadavpur', city: 'Kolkata', source: 'JustDial', business_type: 'individual' }
  ];
  
  const customerStmt = db.prepare(`
    INSERT OR IGNORE INTO customers (name, phone, email, address, city, source, business_type, gst_number)
    VALUES (@name, @phone, @email, @address, @city, @source, @business_type, @gst_number)
  `);
  
  for (const customer of customers) {
    customerStmt.run({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      source: customer.source,
      business_type: customer.business_type,
      gst_number: customer.gst_number || null
    });
  }
  console.log(`Created ${customers.length} sample customers`);
  
  console.log('Creating sample repairs...');
  const services = db.prepare('SELECT id, category, name, price FROM services').all();
  const customerIds = db.prepare('SELECT id FROM customers').all().map(c => c.id);
  
  const repairs = [
    { customer_idx: 0, service_name: 'Windows Installation', device_type: 'LAPTOP', brand: 'Dell', model: 'Inspiron 15', issue: 'System running slow, needs fresh Windows installation', status: 'completed', parts_cost: 0 },
    { customer_idx: 1, service_name: 'Screen Replacement', device_type: 'MOBILE', brand: 'Apple', model: 'iPhone 13', issue: 'Cracked screen after drop', status: 'in_progress', parts_cost: 4500 },
    { customer_idx: 2, service_name: 'Virus Removal', device_type: 'PC', brand: 'HP', model: 'ProDesk 400', issue: 'Multiple virus infections, system compromised', status: 'completed', parts_cost: 0 },
    { customer_idx: 3, service_name: 'Battery Replacement', device_type: 'MOBILE', brand: 'Samsung', model: 'Galaxy S23', issue: 'Battery draining fast, needs replacement', status: 'pending', parts_cost: 1600 },
    { customer_idx: 4, service_name: 'SSD Upgrade', device_type: 'LAPTOP', brand: 'Lenovo', model: 'ThinkPad T480', issue: 'Upgrade from HDD to SSD for better performance', status: 'completed', parts_cost: 3500 },
    { customer_idx: 5, service_name: 'Data Recovery', device_type: 'PC', brand: 'Custom', model: 'Custom Build', issue: 'Hard drive failure, need to recover important data', status: 'in_progress', parts_cost: 500 },
    { customer_idx: 6, service_name: 'Charging Port Repair', device_type: 'MOBILE', brand: 'OnePlus', model: 'Nord 3', issue: 'Charging port loose, not charging properly', status: 'diagnosis_done', parts_cost: 600 },
    { customer_idx: 7, service_name: 'Laptop Screen Replacement', device_type: 'LAPTOP', brand: 'Asus', model: 'VivoBook 15', issue: 'Screen flickering and has dead pixels', status: 'pending', parts_cost: 4000 },
    { customer_idx: 8, service_name: 'RAM Upgrade', device_type: 'LAPTOP', brand: 'Acer', model: 'Aspire 5', issue: 'Need to upgrade RAM from 8GB to 16GB', status: 'completed', parts_cost: 2500 },
    { customer_idx: 9, service_name: 'Software Repair', device_type: 'MOBILE', brand: 'Xiaomi', model: 'Redmi Note 12', issue: 'Phone stuck in boot loop', status: 'completed', parts_cost: 0 }
  ];
  
  for (const repair of repairs) {
    const service = services.find(s => s.name === repair.service_name);
    if (!service) continue;
    
    const invoiceNumber = getNextInvoiceNumber();
    const laborCost = service.price;
    const totalCost = laborCost + repair.parts_cost;
    const gstAmount = totalCost * 0.18;
    const finalPrice = totalCost + gstAmount;
    
    const completedAt = repair.status === 'completed' ? new Date().toISOString() : null;
    const warrantyExpiry = repair.status === 'completed' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
      : null;
    
    db.prepare(`
      INSERT INTO repairs (
        invoice_number, customer_id, service_id, device_type, brand, model,
        issue_description, status, parts_cost, labor_cost, total_cost,
        gst_amount, final_price, completed_at, warranty_expiry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      invoiceNumber,
      customerIds[repair.customer_idx],
      service.id,
      repair.device_type,
      repair.brand,
      repair.model,
      repair.issue,
      repair.status,
      repair.parts_cost,
      laborCost,
      totalCost,
      gstAmount,
      finalPrice,
      completedAt,
      warrantyExpiry
    );
  }
  console.log(`Created ${repairs.length} sample repairs`);
  
  console.log('Creating sample invoices...');
  const completedRepairs = db.prepare(`
    SELECT r.*, c.name as customer_name 
    FROM repairs r 
    JOIN customers c ON r.customer_id = c.id 
    WHERE r.status = 'completed'
  `).all();
  
  for (const repair of completedRepairs) {
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const isPaid = Math.random() > 0.3;
    
    db.prepare(`
      INSERT INTO invoices (
        invoice_number, customer_id, repair_id, subtotal, gst_rate, gst_amount,
        total_amount, payment_status, payment_method, due_date, payment_date
      ) VALUES (?, ?, ?, ?, 18, ?, ?, ?, ?, ?, ?)
    `).run(
      repair.invoice_number,
      repair.customer_id,
      repair.id,
      repair.total_cost,
      repair.gst_amount,
      repair.final_price,
      isPaid ? 'paid' : 'unpaid',
      isPaid ? 'gpay' : null,
      dueDate,
      isPaid ? new Date().toISOString() : null
    );
    
    if (isPaid) {
      const invoiceId = db.prepare('SELECT id FROM invoices WHERE invoice_number = ?').get(repair.invoice_number).id;
      db.prepare(`
        INSERT INTO payments (invoice_id, amount, payment_method, payment_date, reference_number)
        VALUES (?, ?, 'gpay', datetime('now'), ?)
      `).run(invoiceId, repair.final_price, `GPAY${Date.now()}`);
      
      db.prepare(`
        UPDATE customers SET total_spent = total_spent + ?, repair_count = repair_count + 1 WHERE id = ?
      `).run(repair.final_price, repair.customer_id);
    }
  }
  console.log(`Created ${completedRepairs.length} sample invoices`);
  
  console.log('Creating sample digital service projects...');
  const digitalServices = [
    { customer_idx: 2, service_type: 'WEBSITE', title: 'Corporate Website Redesign', amount: 35000, status: 'in_progress', is_retainer: false },
    { customer_idx: 5, service_type: 'SEO', title: 'Monthly SEO Package', amount: 15000, status: 'signed', is_retainer: true, retainer_frequency: 'monthly' },
    { customer_idx: 8, service_type: 'SOCIAL_MEDIA', title: 'Social Media Management', amount: 12000, status: 'proposal', is_retainer: true, retainer_frequency: 'monthly' },
    { customer_idx: 2, service_type: 'WEBSITE', title: 'E-commerce Platform Development', amount: 75000, status: 'in_progress', is_retainer: false },
    { customer_idx: 5, service_type: 'CUSTOM', title: 'Google Ads Campaign', amount: 10000, status: 'completed', is_retainer: true, retainer_frequency: 'monthly' }
  ];
  
  for (const ds of digitalServices) {
    const projectId = getNextProjectId();
    const gstAmount = ds.amount * 0.18;
    const totalAmount = ds.amount + gstAmount;
    
    db.prepare(`
      INSERT INTO digital_services (
        project_id, customer_id, service_type, title, amount, gst_amount, total_amount,
        status, is_retainer, retainer_amount, retainer_frequency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      customerIds[ds.customer_idx],
      ds.service_type,
      ds.title,
      ds.amount,
      gstAmount,
      totalAmount,
      ds.status,
      ds.is_retainer ? 1 : 0,
      ds.is_retainer ? ds.amount : null,
      ds.retainer_frequency || null
    );
  }
  console.log(`Created ${digitalServices.length} sample digital service projects`);
  
  console.log('Database seeding completed successfully!');
  console.log('\n=== Login Credentials ===');
  console.log('Admin: admin / 007JamesBond@@');
  console.log('Technician: technician / Tech@123');
  console.log('=========================\n');
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase };
