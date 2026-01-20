# ByteCare API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Login
```
POST /auth/login
```

Request:
```json
{
  "email": "harryroger798@gmail.com",
  "password": "007JamesBond@@"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "harryroger798@gmail.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Register (Admin only)
```
POST /auth/register
```

Request:
```json
{
  "username": "technician1",
  "email": "tech@bytecare.com",
  "password": "Tech@123456",
  "role": "technician"
}
```

### Change Password
```
POST /auth/change-password
```

Request:
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

## Customers

### List Customers
```
GET /customers
```

Query Parameters:
- `page` (default: 1)
- `limit` (default: 20)
- `search` - Search by name, phone, or email
- `source` - Filter by source (walk_in, referral, google, social_media)
- `business_type` - Filter by type (individual, business)
- `sort_by` (default: created_at)
- `sort_order` (default: desc)

### Create Customer
```
POST /customers
```

Request:
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "Kolkata",
  "source": "walk_in",
  "business_type": "individual",
  "gst_number": null
}
```

### Get Customer
```
GET /customers/:id
```

### Update Customer
```
PUT /customers/:id
```

### Delete Customer
```
DELETE /customers/:id
```

### Get Customer Repairs
```
GET /customers/:id/repairs
```

### Get Customer Invoices
```
GET /customers/:id/invoices
```

### Get Customer Stats
```
GET /customers/:id/stats
```

## Repairs

### List Repairs
```
GET /repairs
```

Query Parameters:
- `page`, `limit`
- `status` - pending, diagnosed, waiting_parts, in_progress, completed, delivered, cancelled
- `device_type` - laptop, desktop, mobile, tablet, other
- `customer_id`
- `date_from`, `date_to`
- `search`

### Create Repair
```
POST /repairs
```

Request:
```json
{
  "customer_id": 1,
  "service_id": 1,
  "device_type": "laptop",
  "brand": "Dell",
  "model": "Inspiron 15",
  "serial_number": "ABC123",
  "issue_description": "Screen not working",
  "priority": "normal",
  "parts_cost": 500
}
```

### Get Repair
```
GET /repairs/:id
```

### Update Repair
```
PUT /repairs/:id
```

### Update Repair Status
```
PATCH /repairs/:id/status
```

Request:
```json
{
  "status": "in_progress"
}
```

### Complete Repair
```
POST /repairs/:id/complete
```

### Get Status Summary
```
GET /repairs/status/summary
```

## Services

### List Services
```
GET /services
```

Query Parameters:
- `category` - pc_repair, mobile_repair, digital_services
- `search`

### Create Service (Admin only)
```
POST /services
```

Request:
```json
{
  "name": "Screen Replacement",
  "category": "mobile_repair",
  "description": "Replace broken screen",
  "base_price": 2500,
  "estimated_time": 60,
  "is_active": true
}
```

### Get Service
```
GET /services/:id
```

### Update Service (Admin only)
```
PUT /services/:id
```

### Delete Service (Admin only)
```
DELETE /services/:id
```

### Phone Models

#### List Phone Models
```
GET /services/phone-models/list
```

#### Create Phone Model
```
POST /services/phone-models
```

Request:
```json
{
  "brand": "Samsung",
  "model": "Galaxy S21",
  "screen_price": 8000,
  "battery_price": 1500,
  "charging_port_price": 800,
  "back_panel_price": 2000,
  "software_price": 500
}
```

#### Get Phone Quote
```
GET /services/phone-models/:id/quote
```

## Invoices

### List Invoices
```
GET /invoices
```

Query Parameters:
- `page`, `limit`
- `status` - unpaid, partial, paid, overdue
- `customer_id`
- `date_from`, `date_to`
- `search`

### Get Invoice
```
GET /invoices/:id
```

### Generate Invoice from Repair
```
POST /invoices/:repairId/generate
```

### Mark Invoice as Paid
```
POST /invoices/:id/mark-paid
```

Request:
```json
{
  "amount": 5000,
  "payment_method": "upi",
  "reference_number": "TXN123456"
}
```

### Get Payment QR Code
```
GET /invoices/:id/payment-qr
```

### Send Invoice Email
```
POST /invoices/:id/send-email
```

### Send Invoice SMS
```
POST /invoices/:id/send-sms
```

### Get Overdue Invoices
```
GET /invoices/overdue/list
```

## Digital Services

### List Projects
```
GET /digital-services
```

Query Parameters:
- `page`, `limit`
- `status` - pending, in_progress, review, completed, cancelled
- `service_type` - website, app, seo, social_media, graphic_design, video_editing, other
- `customer_id`
- `is_retainer` - true/false
- `search`

### Create Project
```
POST /digital-services
```

Request:
```json
{
  "project_name": "Company Website",
  "customer_id": 1,
  "service_type": "website",
  "description": "Build a company website",
  "is_retainer": false,
  "total_amount": 25000,
  "deadline": "2024-03-01"
}
```

### Get Project
```
GET /digital-services/:id
```

### Update Project
```
PUT /digital-services/:id
```

### Update Project Status
```
PATCH /digital-services/:id/status
```

### Get Active Retainers
```
GET /digital-services/retainers/active
```

## Dashboard

### Get Overview
```
GET /dashboard/overview
```

Response includes:
- Today's revenue and repairs
- Weekly and monthly stats
- Pending repairs count
- Pending payments
- Customer counts

### Get Revenue Chart
```
GET /dashboard/revenue-chart?period=month
```

### Get Repair Status Distribution
```
GET /dashboard/repair-status
```

### Get Top Services
```
GET /dashboard/top-services
```

### Get Customer Acquisition
```
GET /dashboard/customer-acquisition
```

### Get Recent Repairs
```
GET /dashboard/recent-repairs?limit=5
```

### Get Recent Invoices
```
GET /dashboard/recent-invoices?limit=5
```

### Get Alerts
```
GET /dashboard/alerts
```

## Settings

### Get All Settings
```
GET /settings
```

### Get Public Settings (No auth required)
```
GET /settings/public
```

### Update Settings (Admin only)
```
PUT /settings
```

Request:
```json
{
  "business_name": "ByteCare",
  "business_phone": "9876543210",
  "gst_enabled": true,
  "gst_rate": 18
}
```

### Update Integrations (Admin only)
```
PUT /settings/integrations
```

Request:
```json
{
  "airtable_api_key": "pat...",
  "airtable_base_id": "app...",
  "omnisend_api_key": "..."
}
```

### Get Activity Log
```
GET /settings/activity-log
```

Query Parameters:
- `page`, `limit`
- `user_id`
- `action` - create, update, delete, login, logout
- `table_name`
- `date_from`, `date_to`

## Airtable Sync

### Get Sync Status
```
GET /airtable/status
```

### Trigger Manual Sync
```
POST /airtable/sync-now
```

### Test Connection
```
POST /airtable/test-connection
```

### Get Sync History
```
GET /airtable/sync-history
```

## Exports

### Export CSV
```
POST /exports/csv
```

Request:
```json
{
  "type": "repairs",
  "month": 1,
  "year": 2024
}
```

### Export GSTR-1
```
POST /exports/gstr1
```

Request:
```json
{
  "month": 1,
  "year": 2024
}
```

### Get Monthly Report
```
GET /exports/monthly-report?month=1&year=2024
```

## Backup

### Create Backup (Admin only)
```
POST /backup/create
```

### List Backups
```
GET /backup/list
```

### Download Backup
```
GET /backup/download/:filename
```

### Restore Backup (Admin only)
```
POST /backup/restore/:id
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

## Pagination

List endpoints return paginated results:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
