import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { USERS, PASSWORD, URLS, PRODUCTS } from '../utils/testData';

test.describe('Cart Page', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD, PASSWORD);
    await expect(page).toHaveURL(URLS.INVENTORY);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
  });

  // ── Empty Cart ───────────────────────────────

  test('should show empty cart when no items added', async () => {
    await productsPage.goToCart();
    expect(await cartPage.isCartEmpty()).toBe(true);
  });

  test('should display Your Cart title', async () => {
    await productsPage.goToCart();
    await expect(cartPage.title).toHaveText('Your Cart');
  });

  // ── Adding Items ─────────────────────────────

  test('should show added item in cart', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.goToCart();
    const items = await cartPage.getCartItemNames();
    expect(items).toContain(PRODUCTS.BACKPACK.name);
  });

  test('should show multiple added items in cart', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.addToCart(PRODUCTS.BOLT_TSHIRT.slug);
    await productsPage.goToCart();
    const items = await cartPage.getCartItemNames();
    expect(items).toContain(PRODUCTS.BACKPACK.name);
    expect(items).toContain(PRODUCTS.BIKE_LIGHT.name);
    expect(items).toContain(PRODUCTS.BOLT_TSHIRT.name);
    expect(items).toHaveLength(3);
  });

  test('should display correct prices in cart', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.ONESIE.slug);
    await productsPage.goToCart();
    const prices = await cartPage.getCartItemPrices();
    expect(prices).toContain(PRODUCTS.BACKPACK.price);
    expect(prices).toContain(PRODUCTS.ONESIE.price);
  });

  test('should display quantity of 1 for each item', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.goToCart();
    const qty = await cartPage.cartItemQuantities.first().textContent();
    expect(qty?.trim()).toBe('1');
  });

  // ── Removing Items ───────────────────────────

  test('should remove item from cart', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.goToCart();
    await cartPage.removeItem(PRODUCTS.BACKPACK.slug);
    expect(await cartPage.isCartEmpty()).toBe(true);
  });

  test('should remove all items from cart', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.goToCart();
    await cartPage.removeItem(PRODUCTS.BACKPACK.slug);
    await cartPage.removeItem(PRODUCTS.BIKE_LIGHT.slug);
    expect(await cartPage.isCartEmpty()).toBe(true);
  });

  test('should keep remaining items after removing one', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.addToCart(PRODUCTS.ONESIE.slug);
    await productsPage.goToCart();
    await cartPage.removeItem(PRODUCTS.BIKE_LIGHT.slug);
    const items = await cartPage.getCartItemNames();
    expect(items).toHaveLength(2);
    expect(items).toContain(PRODUCTS.BACKPACK.name);
    expect(items).toContain(PRODUCTS.ONESIE.name);
    expect(items).not.toContain(PRODUCTS.BIKE_LIGHT.name);
  });

  // ── Navigation ───────────────────────────────

  test('should navigate back to products via Continue Shopping', async ({ page }) => {
    await productsPage.goToCart();
    await cartPage.continueShopping();
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  test('should navigate to checkout step one', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.goToCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
  });

  // ── Persistence ──────────────────────────────

  test('should persist cart items after navigating away and back', async () => {
    await productsPage.addToCart(PRODUCTS.FLEECE_JACKET.slug);
    await productsPage.addToCart(PRODUCTS.BOLT_TSHIRT.slug);
    // Navigate to cart, then back to products, then to cart again
    await productsPage.goToCart();
    await cartPage.continueShopping();
    await productsPage.goToCart();
    const items = await cartPage.getCartItemNames();
    expect(items).toContain(PRODUCTS.FLEECE_JACKET.name);
    expect(items).toContain(PRODUCTS.BOLT_TSHIRT.name);
  });

  test('should update cart badge to match cart item count', async () => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    const badge = await productsPage.getCartBadgeCount();
    await productsPage.goToCart();
    const cartCount = await cartPage.getCartItemCount();
    expect(badge).toBe(cartCount);
  });
});
