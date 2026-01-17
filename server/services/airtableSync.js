const axios = require('axios');
const { getDatabase, getSetting } = require('../database/db');
const { logger } = require('../middleware/errorHandler');
const { SYNC_STATUS, AIRTABLE_MAX_RECORDS_PER_REQUEST } = require('../config/constants');

const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

class AirtableSync {
  constructor() {
    this.apiKey = null;
    this.baseId = null;
    this.client = null;
  }

  initialize() {
    this.apiKey = getSetting('airtable_api_key');
    this.baseId = getSetting('airtable_base_id');

    if (!this.apiKey || !this.baseId) {
      throw new Error('Airtable API key or Base ID not configured');
    }

    this.client = axios.create({
      baseURL: `${AIRTABLE_API_URL}/${this.baseId}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async testConnection() {
    this.initialize();

    try {
      const response = await this.client.get('/Customers', {
        params: { maxRecords: 1 }
      });

      return {
        success: true,
        message: 'Connection successful',
        tables_accessible: true
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'Connection successful but tables may need to be created',
          tables_accessible: false
        };
      }
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async syncAll(tables = null) {
    this.initialize();
    const db = getDatabase();

    const tablesToSync = tables || ['customers', 'repairs', 'invoices', 'digital_services'];
    const results = {};

    for (const table of tablesToSync) {
      try {
        results[table] = await this.syncTable(table);
      } catch (error) {
        results[table] = {
          success: false,
          error: error.message,
          records_synced: 0
        };

        db.prepare(`
          INSERT INTO sync_history (table_name, records_synced, records_failed, status, error_message, started_at, completed_at)
          VALUES (?, 0, 0, 'failed', ?, datetime('now'), datetime('now'))
        `).run(table, error.message);
      }
    }

    return results;
  }

  async syncTable(tableName) {
    const db = getDatabase();
    const startedAt = new Date().toISOString();

    const unsyncedRecords = db.prepare(`
      SELECT * FROM ${tableName}
      WHERE synced_to_airtable = 0
      LIMIT ?
    `).all(AIRTABLE_MAX_RECORDS_PER_REQUEST);

    if (unsyncedRecords.length === 0) {
      return {
        success: true,
        records_synced: 0,
        message: 'No records to sync'
      };
    }

    const airtableTableName = this.getAirtableTableName(tableName);
    let syncedCount = 0;
    let failedCount = 0;

    for (const record of unsyncedRecords) {
      try {
        const airtableRecord = this.transformToAirtable(tableName, record);

        let response;
        if (record.airtable_id) {
          response = await this.client.patch(`/${airtableTableName}/${record.airtable_id}`, {
            fields: airtableRecord
          });
        } else {
          response = await this.client.post(`/${airtableTableName}`, {
            fields: airtableRecord
          });

          db.prepare(`
            UPDATE ${tableName} SET airtable_id = ? WHERE id = ?
          `).run(response.data.id, record.id);
        }

        db.prepare(`
          UPDATE ${tableName} SET synced_to_airtable = 1 WHERE id = ?
        `).run(record.id);

        syncedCount++;

        await this.delay(200);
      } catch (error) {
        logger.error(`Failed to sync ${tableName} record ${record.id}:`, error.message);
        failedCount++;
      }
    }

    const status = failedCount === 0 ? SYNC_STATUS.SUCCESS : 
                   syncedCount > 0 ? SYNC_STATUS.PARTIAL : SYNC_STATUS.FAILED;

    db.prepare(`
      INSERT INTO sync_history (table_name, records_synced, records_failed, status, started_at, completed_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(tableName, syncedCount, failedCount, status, startedAt);

    return {
      success: status !== SYNC_STATUS.FAILED,
      records_synced: syncedCount,
      records_failed: failedCount,
      status
    };
  }

  getAirtableTableName(localTableName) {
    const mapping = {
      'customers': 'Customers',
      'repairs': 'Repairs',
      'invoices': 'Invoices',
      'digital_services': 'Digital Services'
    };
    return mapping[localTableName] || localTableName;
  }

  transformToAirtable(tableName, record) {
    switch (tableName) {
      case 'customers':
        return {
          'Name': record.name,
          'Phone': record.phone,
          'Email': record.email || '',
          'Address': record.address || '',
          'City': record.city || '',
          'GST Number': record.gst_number || '',
          'Business Type': record.business_type || '',
          'Source': record.source || '',
          'Total Spent': record.total_spent || 0,
          'Repair Count': record.repair_count || 0,
          'Created At': record.created_at
        };

      case 'repairs':
        return {
          'Invoice Number': record.invoice_number,
          'Customer ID': record.customer_id,
          'Device Type': record.device_type,
          'Brand': record.brand || '',
          'Model': record.model || '',
          'Issue': record.issue_description,
          'Diagnosis': record.diagnosis || '',
          'Parts Cost': record.parts_cost || 0,
          'Labor Cost': record.labor_cost || 0,
          'Total Cost': record.total_cost || 0,
          'GST Amount': record.gst_amount || 0,
          'Final Price': record.final_price || 0,
          'Status': record.status,
          'Priority': record.priority || 'normal',
          'Warranty Days': record.warranty_days || 30,
          'Created At': record.created_at,
          'Completed At': record.completed_at || ''
        };

      case 'invoices':
        return {
          'Invoice Number': record.invoice_number,
          'Customer ID': record.customer_id,
          'Subtotal': record.subtotal || 0,
          'GST Rate': record.gst_rate || 18,
          'GST Amount': record.gst_amount || 0,
          'Total Amount': record.total_amount || 0,
          'Payment Status': record.payment_status,
          'Payment Method': record.payment_method || '',
          'Invoice Date': record.invoice_date,
          'Due Date': record.due_date || '',
          'Payment Date': record.payment_date || ''
        };

      case 'digital_services':
        return {
          'Project ID': record.project_id,
          'Customer ID': record.customer_id,
          'Service Type': record.service_type,
          'Title': record.title,
          'Description': record.description || '',
          'Amount': record.amount || 0,
          'Total Amount': record.total_amount || 0,
          'Status': record.status,
          'Is Retainer': record.is_retainer ? 'Yes' : 'No',
          'Due Date': record.due_date || '',
          'Created At': record.created_at
        };

      default:
        return record;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AirtableSync();
