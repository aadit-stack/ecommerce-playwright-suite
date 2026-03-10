// ──────────────────────────────────────────────
// URLs
// ──────────────────────────────────────────────
export const URLS = {
  LOGIN: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;

// ──────────────────────────────────────────────
// Credentials
// ──────────────────────────────────────────────
export const USERS = {
  STANDARD: 'standard_user',
  LOCKED_OUT: 'locked_out_user',
  PROBLEM: 'problem_user',
  PERFORMANCE_GLITCH: 'performance_glitch_user',
  ERROR: 'error_user',
  VISUAL: 'visual_user',
} as const;

export const PASSWORD = 'secret_sauce';
export const INVALID_PASSWORD = 'wrong_password';
export const INVALID_USERNAME = 'invalid_user';

// ──────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────
export const PRODUCTS = {
  BACKPACK: { name: 'Sauce Labs Backpack', price: 29.99 },
  BIKE_LIGHT: { name: 'Sauce Labs Bike Light', price: 9.99 },
  BOLT_TSHIRT: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  FLEECE_JACKET: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  ONESIE: { name: 'Sauce Labs Onesie', price: 7.99 },
  TSHIRT_RED: { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const;

export const ALL_PRODUCT_NAMES = Object.values(PRODUCTS).map((p) => p.name);
export const TOTAL_PRODUCTS = 6;

// ──────────────────────────────────────────────
// Sort Options
// ──────────────────────────────────────────────
export const SORT_OPTIONS = {
  NAME_ASC: 'az',
  NAME_DESC: 'za',
  PRICE_LOW_HIGH: 'lohi',
  PRICE_HIGH_LOW: 'hilo',
} as const;

// ──────────────────────────────────────────────
// Error Messages
// ──────────────────────────────────────────────
export const LOGIN_ERRORS = {
  USERNAME_REQUIRED: 'Epic sadface: Username is required',
  PASSWORD_REQUIRED: 'Epic sadface: Password is required',
  CREDENTIALS_MISMATCH:
    'Epic sadface: Username and password do not match any user in this service',
  LOCKED_OUT:
    'Epic sadface: Sorry, this user has been locked out.',
} as const;

export const CHECKOUT_ERRORS = {
  FIRST_NAME_REQUIRED: 'Error: First Name is required',
  LAST_NAME_REQUIRED: 'Error: Last Name is required',
  POSTAL_CODE_REQUIRED: 'Error: Postal Code is required',
} as const;

// ──────────────────────────────────────────────
// Checkout Form Data
// ──────────────────────────────────────────────
export const CHECKOUT_INFO = {
  FIRST_NAME: 'John',
  LAST_NAME: 'Doe',
  POSTAL_CODE: '12345',
} as const;

// ──────────────────────────────────────────────
// UI Strings
// ──────────────────────────────────────────────
export const PAGE_TITLE = 'Swag Labs';
export const CHECKOUT_COMPLETE_HEADER = 'Thank you for your order!';
export const CHECKOUT_COMPLETE_TEXT =
  'Your order has been dispatched, and will arrive just as fast as the pony can get there!';
