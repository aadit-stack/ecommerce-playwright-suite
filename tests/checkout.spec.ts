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
  TOTAL_PRODUCTS,
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
    await expect(productsPage.inventoryItems).toHaveCount(TOTAL_PRODUCTS);
  });

  /** Helper — add items by slug, go to cart, click checkout */
  async function navigateToCheckout(slugs: string[] = [PRODUCTS.BACKPACK.slug]) {
    for (const slug of slugs) {
      await productsPage.addToCart(slug);
    }
    await expect(productsPage.cartBadge).toHaveText(String(slugs.length));
    await productsPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(slugs.length);
    await cartPage.checkout();
    await expect(checkoutPage.firstNameInput).toBeVisible();
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
    await expect(checkoutPage.completeHeader).toContainText(CHECKOUT_COMPLETE_HEADER);
  });

  test('should complete checkout with multiple items', async ({ page }) => {
    await navigateToCheckout([
      PRODUCTS.BACKPACK.slug,
      PRODUCTS.BIKE_LIGHT.slug,
      PRODUCTS.FLEECE_JACKET.slug,
    ]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(checkoutPage.summaryItems).toHaveCount(3);
    await checkoutPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
  });

  // ── Validation Errors (Step One) ─────────────

  test('should show error when first name is empty', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation('', CHECKOUT_INFO.LAST_NAME, CHECKOUT_INFO.POSTAL_CODE);
    await expect(checkoutPage.errorMessage).toContainText(CHECKOUT_ERRORS.FIRST_NAME_REQUIRED);
  });

  test('should show error when last name is empty', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(CHECKOUT_INFO.FIRST_NAME, '', CHECKOUT_INFO.POSTAL_CODE);
    await expect(checkoutPage.errorMessage).toContainText(CHECKOUT_ERRORS.LAST_NAME_REQUIRED);
  });

  test('should show error when postal code is empty', async () => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(CHECKOUT_INFO.FIRST_NAME, CHECKOUT_INFO.LAST_NAME, '');
    await expect(checkoutPage.errorMessage).toContainText(CHECKOUT_ERRORS.POSTAL_CODE_REQUIRED);
  });

  test('should show first name error when all fields empty', async () => {
    await navigateToCheckout();
    await checkoutPage.clickContinueWithoutFilling();
    await expect(checkoutPage.errorMessage).toContainText(CHECKOUT_ERRORS.FIRST_NAME_REQUIRED);
  });

  // ── Cancel Navigation ────────────────────────

  test('should return to cart when cancelling on step one', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.cancel();
    await page.waitForURL('**/cart.html');
    await expect(page).toHaveURL(URLS.CART);
  });

  test('should return to inventory when cancelling on step two', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    await checkoutPage.cancel();
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  // ── Overview Page (Step Two) ─────────────────

  test('should display correct items on overview page', async ({ page }) => {
    await navigateToCheckout([PRODUCTS.BACKPACK.slug, PRODUCTS.ONESIE.slug]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    await expect(checkoutPage.summaryItems).toHaveCount(2);
    await expect(checkoutPage.summaryItemNames.filter({ hasText: PRODUCTS.BACKPACK.name })).toBeVisible();
    await expect(checkoutPage.summaryItemNames.filter({ hasText: PRODUCTS.ONESIE.name })).toBeVisible();
  });

  test('should display subtotal on overview', async ({ page }) => {
    await navigateToCheckout([PRODUCTS.BACKPACK.slug]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    await expect(checkoutPage.subtotalLabel).toContainText('Item total');
    const subtotal = await checkoutPage.getSubtotal();
    expect(subtotal).toBe(PRODUCTS.BACKPACK.price);
  });

  test('should display tax on overview', async ({ page }) => {
    await navigateToCheckout([PRODUCTS.BACKPACK.slug]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    await expect(checkoutPage.taxLabel).toContainText('Tax');
    const tax = await checkoutPage.getTax();
    expect(tax).toBeGreaterThan(0);
  });

  test('should have total equal to subtotal plus tax', async ({ page }) => {
    await navigateToCheckout([PRODUCTS.BACKPACK.slug, PRODUCTS.BIKE_LIGHT.slug]);
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_TWO);
    await expect(checkoutPage.subtotalLabel).toContainText('Item total');
    await expect(checkoutPage.taxLabel).toContainText('Tax');
    await expect(checkoutPage.totalLabel).toContainText('Total');
    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  // ── Checkout Complete ────────────────────────

  test('should show confirmation header after finishing', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
    await expect(checkoutPage.completeHeader).toContainText(CHECKOUT_COMPLETE_HEADER);
  });

  test('should show confirmation text after finishing', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
    await expect(checkoutPage.completeText).toContainText(CHECKOUT_COMPLETE_TEXT);
  });

  test('should navigate back to products from checkout complete', async ({ page }) => {
    await navigateToCheckout();
    await checkoutPage.fillInformation(
      CHECKOUT_INFO.FIRST_NAME,
      CHECKOUT_INFO.LAST_NAME,
      CHECKOUT_INFO.POSTAL_CODE
    );
    await checkoutPage.finish();
    await expect(page).toHaveURL(URLS.CHECKOUT_COMPLETE);
    await checkoutPage.backToProducts();
    await expect(page).toHaveURL(URLS.INVENTORY);
  });
});
