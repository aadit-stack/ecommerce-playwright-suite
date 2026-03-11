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
  });

  // ── Display Tests ────────────────────────────

  test('should display exactly 6 products', async () => {
    const count = await productsPage.getProductCount();
    expect(count).toBe(TOTAL_PRODUCTS);
  });

  test('should display all expected product names', async () => {
    const names = await productsPage.getProductNames();
    for (const expected of ALL_PRODUCT_NAMES) {
      expect(names).toContain(expected);
    }
  });

  test('should display a price for every product', async () => {
    const prices = await productsPage.getProductPrices();
    expect(prices).toHaveLength(TOTAL_PRODUCTS);
    for (const price of prices) {
      expect(price).toBeGreaterThan(0);
    }
  });

  test('should display an image for every product', async () => {
    const count = await productsPage.inventoryItemImages.count();
    expect(count).toBe(TOTAL_PRODUCTS);
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
    const names = await productsPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('should sort products by name Z to A', async () => {
    await productsPage.sortBy(SORT_OPTIONS.NAME_DESC);
    const names = await productsPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('should sort products by price low to high', async () => {
    await productsPage.sortBy(SORT_OPTIONS.PRICE_LOW_HIGH);
    const prices = await productsPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('should sort products by price high to low', async () => {
    await productsPage.sortBy(SORT_OPTIONS.PRICE_HIGH_LOW);
    const prices = await productsPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  // ── Add / Remove from Cart ───────────────────

  test('should show cart badge with 1 after adding one item', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    const badge = await productsPage.getCartBadgeCount();
    expect(badge).toBe(1);
  });

  test('should show cart badge with correct count for multiple items', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.addToCart(PRODUCTS.ONESIE.slug);
    const badge = await productsPage.getCartBadgeCount();
    expect(badge).toBe(3);
  });

  test('should change button to Remove after adding item', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    const removeBtn = productsPage.page.locator(
      `[data-test="remove-${PRODUCTS.BACKPACK.slug}"]`
    );
    await expect(removeBtn).toBeVisible();
  });

  test('should change button back to Add to cart after removing', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.removeFromCart(PRODUCTS.BACKPACK.slug);
    const addBtn = productsPage.page.locator(
      `[data-test="add-to-cart-${PRODUCTS.BACKPACK.slug}"]`
    );
    await expect(addBtn).toBeVisible();
  });

  test('should hide cart badge when all items removed', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.removeFromCart(PRODUCTS.BACKPACK.slug);
    expect(await productsPage.isCartBadgeVisible()).toBe(false);
  });

  // ── Navigation ───────────────────────────────

  test('should navigate to cart page', async ({ page }) => {
    await productsPage.goToCart();
    await expect(page).toHaveURL(URLS.CART);
  });

  test('should open hamburger menu', async () => {
    await productsPage.openMenu();
    await expect(productsPage.logoutLink).toBeVisible();
  });

  test('should logout and return to login page', async ({ page }) => {
    await productsPage.logout();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to product detail when clicking product name', async ({
    page,
  }) => {
    await productsPage.clickProductName(PRODUCTS.BACKPACK.name);
    await expect(page).toHaveURL(/inventory-item\.html/);
  });
});
