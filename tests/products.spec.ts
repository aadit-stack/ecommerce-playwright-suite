import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import {
  USERS,
  PASSWORD,
  URLS,
  PRODUCTS,
  ALL_PRODUCT_NAMES,
  TOTAL_PRODUCTS,
  SORT_OPTIONS,
} from '../utils/testData';

test.describe('Products Page', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD, PASSWORD);
    await expect(page).toHaveURL(URLS.INVENTORY);
    productsPage = new ProductsPage(page);
    await expect(productsPage.inventoryItems).toHaveCount(TOTAL_PRODUCTS);
  });

  // ── Display Tests ────────────────────────────

  test('should display exactly 6 products', async () => {
    await expect(productsPage.inventoryItems).toHaveCount(TOTAL_PRODUCTS);
  });

  test('should display all expected product names', async () => {
    for (const expected of ALL_PRODUCT_NAMES) {
      await expect(
        productsPage.inventoryItemNames.filter({ hasText: expected })
      ).toBeVisible();
    }
  });

  test('should display a price for every product', async () => {
    await expect(productsPage.inventoryItemPrices).toHaveCount(TOTAL_PRODUCTS);
    const prices = await productsPage.getProductPrices();
    for (const price of prices) {
      expect(price).toBeGreaterThan(0);
    }
  });

  test('should display an image for every product', async () => {
    await expect(productsPage.inventoryItemImages).toHaveCount(TOTAL_PRODUCTS);
  });

  test('should display add-to-cart button for every product', async () => {
    const allProducts = Object.values(PRODUCTS);
    for (const product of allProducts) {
      await expect(
        productsPage.page.locator(`[data-test="add-to-cart-${product.slug}"]`)
      ).toBeVisible();
    }
  });

  test('should display Products page title', async () => {
    await expect(productsPage.title).toHaveText('Products');
  });

  // ── Sorting Tests ────────────────────────────

  test('should sort products by name A to Z', async () => {
    await productsPage.sortBy(SORT_OPTIONS.NAME_ASC);
    await expect(productsPage.inventoryItemNames.first()).toContainText('Sauce Labs Backpack');
    const names = await productsPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('should sort products by name Z to A', async () => {
    await productsPage.sortBy(SORT_OPTIONS.NAME_DESC);
    await expect(productsPage.inventoryItemNames.first()).toContainText('Test.allTheThings()');
    const names = await productsPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('should sort products by price low to high', async () => {
    await productsPage.sortBy(SORT_OPTIONS.PRICE_LOW_HIGH);
    await expect(productsPage.inventoryItemNames.first()).toContainText('Sauce Labs Onesie');
    const prices = await productsPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('should sort products by price high to low', async () => {
    await productsPage.sortBy(SORT_OPTIONS.PRICE_HIGH_LOW);
    await expect(productsPage.inventoryItemNames.first()).toContainText('Sauce Labs Fleece Jacket');
    const prices = await productsPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  // ── Add / Remove from Cart ───────────────────

  test('should show cart badge with 1 after adding one item', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  test('should show cart badge with correct count for multiple items', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.addToCart(PRODUCTS.ONESIE.slug);
    await expect(productsPage.cartBadge).toHaveText('3');
  });

  test('should change button to Remove after adding item', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(
      productsPage.page.locator(`[data-test="remove-${PRODUCTS.BACKPACK.slug}"]`)
    ).toBeVisible();
  });

  test('should change button back to Add to cart after removing', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(
      productsPage.page.locator(`[data-test="remove-${PRODUCTS.BACKPACK.slug}"]`)
    ).toBeVisible();
    await productsPage.removeFromCart(PRODUCTS.BACKPACK.slug);
    await expect(
      productsPage.page.locator(`[data-test="add-to-cart-${PRODUCTS.BACKPACK.slug}"]`)
    ).toBeVisible();
  });

  test('should hide cart badge when all items removed', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).toBeVisible();
    await productsPage.removeFromCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).not.toBeVisible();
  });

  // ── Navigation ───────────────────────────────

  test('should navigate to cart page', async ({ page }) => {
    await productsPage.goToCart();
    await expect(page).toHaveURL(URLS.CART);
  });

  test('should open hamburger menu', async ({ page }) => {
    await productsPage.openMenu();
    await expect(page.locator('.bm-menu-wrap')).toHaveAttribute('aria-hidden', 'false');
    await expect(productsPage.logoutLink).toBeVisible();
  });

  test('should logout and return to login page', async ({ page }) => {
    await productsPage.logout();
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to product detail when clicking product name', async ({
    page,
  }) => {
    await expect(
      productsPage.inventoryItemNames.filter({ hasText: PRODUCTS.BACKPACK.name })
    ).toBeVisible();
    await productsPage.clickProductName(PRODUCTS.BACKPACK.name);
    await expect(page).toHaveURL(/inventory-item\.html/);
  });
});
