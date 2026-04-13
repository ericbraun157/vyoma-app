// Centralized string/enum constants so AsyncStorage keys and route names stay consistent.
export const STORAGE_KEYS = {
  SESSION: '@vyoma/session',
  BUSINESS: '@vyoma/business',
  CUSTOMERS: '@vyoma/customers',
  STAFF: '@vyoma/staff',
  SERVICES: '@vyoma/services',
  BOOKINGS: '@vyoma/bookings',
  INVOICES: '@vyoma/invoices',
  INVENTORY: '@vyoma/inventory',
  HAS_SEEDED: '@vyoma/hasSeeded',
  ONBOARDED: '@vyoma/onboarded'
};

export const ROUTES = {
  // Root
  APP: 'App',
  AUTH: 'Auth',
  MAIN: 'Main',

  // Auth
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  BUSINESS_SETUP: 'BusinessSetup',

  // Tabs
  TAB_DASHBOARD: 'DashboardTab',
  TAB_BOOKINGS: 'BookingsTab',
  TAB_CUSTOMERS: 'CustomersTab',
  TAB_BILLING: 'BillingTab',
  TAB_MORE: 'MoreTab',

  // Stacks
  DASHBOARD: 'Dashboard',
  BOOKINGS: 'Bookings',
  NEW_BOOKING: 'NewBooking',
  BOOKING_DETAIL: 'BookingDetail',

  CUSTOMERS: 'Customers',
  CUSTOMER_DETAIL: 'CustomerDetail',
  ADD_CUSTOMER: 'AddCustomer',

  BILLING: 'Billing',
  CREATE_INVOICE: 'CreateInvoice',
  INVOICE_DETAIL: 'InvoiceDetail',

  SETTINGS: 'Settings',
  STAFF: 'Staff',
  ADD_STAFF: 'AddStaff',
  STAFF_DETAIL: 'StaffDetail',
  INVENTORY: 'Inventory',
  ADD_ITEM: 'AddItem',
  BUSINESS_PROFILE: 'BusinessProfile',
  SERVICES: 'Services',
  PRICING: 'Pricing'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue'
};

export const PAYMENT_METHOD = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card'
};

export const BUSINESS_TYPES = [
  { id: 'salon', label: 'Salon' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'tuition', label: 'Tuition' },
  { id: 'gym', label: 'Gym' },
  { id: 'autorepair', label: 'Auto Repair' },
  { id: 'other', label: 'Other' }
];

export const WHATSAPP_PREFIX = '+91';

// PHASE 2: Replace AsyncStorage calls with API calls to Node.js backend
// PHASE 2: Add multi-branch support (branchId on all models)
