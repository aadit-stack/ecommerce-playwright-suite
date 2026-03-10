import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import {
  USERS,
  PASSWORD,
  URLS,
  PRODUCTS,
  CHECKOUT_INFO,
  CHECKOUT_ERRORS,
  CHECKOUT_COMPLETE_HEADER,
  CHECKOUT_COMPLETE_TEXT,
} from '../utils/testData';

test.describe('Checkout Flow', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD, PASSWORD);
    await expect(page).toHaveURL(URLS.INVENTORY);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  /** Helper — add item, go to cart, click checkout */
  async function navigateToCheckout(items: string[] = [PRODUCTS.BACKPACK.name]) {
    for (const item of items) {
      await productsPage.addToCart(item);
    }
    await productsPage.goToCart();
    await cartPage.checkout();
  }

  // ── Happy-path E2E ───────────────────────────

  test('should complete full checkout flow end-to-end', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    await checkoutPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
    const header = await checkoutPage.getConfirmationHeader();
    expect(header).toBe(CHECKOUT_COMPLETE_HEADER);
  });

  test('should complete checkout with multiple items', async ({ page }) => {
    await navigateToCheckout([
      PRODUCTS.BACKPACK.name,
      PRODUCTS.BIKE_LIGHT.name,
      PRODUCTS.FLEECE_JACKET.name,
    ]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    const items = await checkoutPage.getOverviewItemNames();
    expect(items).toHaveLength(3);
    await checkoutPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
  });

  // ── Validation Errors (Step One) ─────────────

  test('should show error when first name is empty', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation('', CHECKOUT_INFO.LAST_NAME, CHECKOUT_INFO.POSTAL_CODE);
    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(CHECKOUT_ERRORS.FIRST_NAME_REQUIRED);
  });

  test('should show error when last name is empty', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(CHECKOUT_INFO.FIRST_NAME, '', CHECKOUT_INFO.POSTAL_CODE);
    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(CHECKOUT_ERRORS.LAST_NAME_REQUIRED);
  });

  test('should show error when postal code is empty', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(CHECKOUT_INFO.FIRST_NAME, CHECKOUT_INFO.LAST_NAME, '');
    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(CHECKOUT_ERRORS.POSTAL_CODE_REQUIRED);
  });

  test('should show first name error when all fields empty', async () => {
    await navigateToCheckout();
    await checkoutPage.clickContinueWithoutFilling();
    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(CHECKOUT_ERRORS.FIRST_NAME_REQUIRED);
  });

  // ── Cancel Navigation ────────────────────────

  test('should return to cart when cancelling on step one', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.cancel();
    await expect(page).toHaveURL(URLS.CART);
  });

  test('should return to inventory when cancelling on step two', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.cancel();
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  // ── Overview Page (Step Two) ─────────────────

  test('should display correct items on overview page', async () => {
    await navigateToCheckout([PRODUCTS.BACKPACK.name, PRODUCTS.ONESIE.name]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    const items = await checkoutPage.getOverviewItemNames();
    expect(items).toContain(PRODUCTS.BACKPACK.name);
    expect(items).toContain(PRODUCTS.ONESIE.name);
  });

  test('should display subtotal on overview', async () => {
    await navigateToCheckout([PRODUCTS.BACKPACK.name]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    const subtotal = await checkoutPage.getSubtotal();
    expect(subtotal).toBe(PRODUCTS.BACKPACK.price);
  });

  test('should display tax on overview', async () => {
    await navigateToCheckout([PRODUCTS.BACKPACK.name]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    const tax = await checkoutPage.getTax();
    expect(tax).toBeGreaterThan(0);
  });

  test('should have total equal to subtotal plus tax', async () => {
    await navigateToCheckout([PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  // ── Checkout Complete ────────────────────────

  test('should show confirmation header after finishing', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.finish();
    const header = await checkoutPage.getConfirmationHeader();
    expect(header).toBe(CHECKOUT_COMPLETE_HEADER);
  });

  test('should show confirmation text after finishing', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.finish();
    const text = await checkoutPage.getConfirmationText();
    expect(text).toBe(CHECKOUT_COMPLETE_TEXT);
  });

  test('should navigate back to products from checkout complete', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.finish();
    await checkoutPage.backToProducts();
    await expect(page).toHaveURL(URLS.INVENTORY);
  });
});
