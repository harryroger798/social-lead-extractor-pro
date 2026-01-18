module.exports = {
  ROLES: {
    ADMIN: 'admin',
    TECHNICIAN: 'technician',
    VIEWER: 'viewer'
  },
  
  REPAIR_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    DIAGNOSIS_DONE: 'diagnosis_done',
    REPAIR_DONE: 'repair_done',
    READY_PICKUP: 'ready_pickup',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  DEVICE_TYPES: {
    LAPTOP: 'LAPTOP',
    PC: 'PC',
    MOBILE: 'MOBILE',
    TABLET: 'TABLET',
    OTHER: 'OTHER'
  },
  
  SERVICE_CATEGORIES: {
    PC_REPAIR: 'PC_REPAIR',
    MOBILE_REPAIR: 'MOBILE_REPAIR',
    DIGITAL_SERVICE: 'DIGITAL_SERVICE'
  },
  
  MOBILE_REPAIR_TYPES: {
    SOFTWARE: 'SOFTWARE',
    HARDWARE: 'HARDWARE',
    BOTH: 'BOTH'
  },
  
  DIGITAL_SERVICE_TYPES: {
    WEBSITE: 'WEBSITE',
    SEO: 'SEO',
    SOCIAL_MEDIA: 'SOCIAL_MEDIA',
    CUSTOM: 'CUSTOM',
    MAINTENANCE: 'MAINTENANCE'
  },
  
  DIGITAL_SERVICE_STATUS: {
    PROPOSAL: 'proposal',
    SIGNED: 'signed',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  PAYMENT_STATUS: {
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
    PAID: 'paid',
    OVERDUE: 'overdue',
    REFUNDED: 'refunded'
  },
  
  PAYMENT_METHODS: {
    CASH: 'cash',
    GPAY: 'gpay',
    PAYTM: 'paytm',
    BANK_TRANSFER: 'bank_transfer',
    CHEQUE: 'cheque',
    CARD: 'card',
    OTHER: 'other'
  },
  
  CUSTOMER_SOURCES: {
    GMB: 'GMB',
    FACEBOOK: 'Facebook',
    REFERRAL: 'Referral',
    EMAIL: 'Email',
    JUSTDIAL: 'JustDial',
    WALKIN: 'Walk-in',
    OTHER: 'Other'
  },
  
  BUSINESS_TYPES: {
    INDIVIDUAL: 'individual',
    BUSINESS: 'business',
    COACHING: 'coaching',
    CLINIC: 'clinic',
    OTHER: 'other'
  },
  
  PRIORITY: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  MESSAGE_TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    WHATSAPP: 'whatsapp'
  },
  
  MESSAGE_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    OPENED: 'opened',
    CLICKED: 'clicked',
    FAILED: 'failed',
    BOUNCED: 'bounced'
  },
  
  SYNC_STATUS: {
    SUCCESS: 'success',
    PARTIAL: 'partial',
    FAILED: 'failed'
  },
  
  ACTIVITY_ACTIONS: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    LOGIN: 'login',
    LOGOUT: 'logout',
    EXPORT: 'export',
    SYNC: 'sync'
  },
  
  BACKUP_TYPES: {
    AUTO: 'auto',
    MANUAL: 'manual',
    SCHEDULED: 'scheduled'
  },
  
  RETAINER_FREQUENCY: {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly'
  },
  
  INVOICE_TYPES: {
    REPAIR: 'repair',
    DIGITAL_SERVICE: 'digital_service',
    PRODUCT: 'product',
    OTHER: 'other'
  },
  
  DEFAULT_GST_RATE: 18,
  DEFAULT_WARRANTY_DAYS: 30,
  DEFAULT_PAGINATION_LIMIT: 50,
  MAX_PAGINATION_LIMIT: 100,
  
  AIRTABLE_SYNC_INTERVAL_MINUTES: 30,
  AIRTABLE_MAX_RECORDS_PER_REQUEST: 10,
  AIRTABLE_MAX_CALLS_PER_MONTH: 1000,
  
  OMNISEND_MAX_EMAILS_PER_MONTH: 10000,
  
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  
  PASSWORD_MIN_LENGTH: 8,
  
  TURNAROUND_ALERT_HOURS: 48
};
