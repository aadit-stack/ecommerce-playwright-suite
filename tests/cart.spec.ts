import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { USERS, PASSWORD, URLS, PRODUCTS, TOTAL_PRODUCTS } from '../utils/testData';

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
    await expect(productsPage.inventoryItems).toHaveCount(TOTAL_PRODUCTS);
  });

  /** Helper — navigate to cart and wait for it to fully load */
  async function goToCartAndWait(page: import('@playwright/test').Page) {
    await productsPage.goToCart();
    await page.waitForURL('**/cart.html');
    await expect(cartPage.cartContentsContainer).toBeVisible();
  }

  // ── Empty Cart ───────────────────────────────

  test('should show empty cart when no items added', async ({ page }) => {
    await goToCartAndWait(page);
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('should display Your Cart title', async ({ page }) => {
    await goToCartAndWait(page);
    await expect(cartPage.title).toHaveText('Your Cart');
  });

  // ── Adding Items ─────────────────────────────

  test('should show added item in cart', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).toHaveText('1');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItemNames.first()).toContainText(PRODUCTS.BACKPACK.name);
  });

  test('should show multiple added items in cart', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.addToCart(PRODUCTS.BOLT_TSHIRT.slug);
    await expect(productsPage.cartBadge).toHaveText('3');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(3);
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.BACKPACK.name })).toBeVisible();
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.BIKE_LIGHT.name })).toBeVisible();
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.BOLT_TSHIRT.name })).toBeVisible();
  });

  test('should display correct prices in cart', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.ONESIE.slug);
    await expect(productsPage.cartBadge).toHaveText('2');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.cartItemPrices.filter({ hasText: `$${PRODUCTS.BACKPACK.price}` })).toBeVisible();
    await expect(cartPage.cartItemPrices.filter({ hasText: `$${PRODUCTS.ONESIE.price}` })).toBeVisible();
  });

  test('should display quantity of 1 for each item', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).toHaveText('1');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItemQuantities.first()).toHaveText('1');
  });

  // ── Removing Items ───────────────────────────

  test('should remove item from cart', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).toHaveText('1');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.removeItem(PRODUCTS.BACKPACK.slug);
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('should remove all items from cart', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await expect(productsPage.cartBadge).toHaveText('2');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(2);
    await cartPage.removeItem(PRODUCTS.BACKPACK.slug);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.removeItem(PRODUCTS.BIKE_LIGHT.slug);
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('should keep remaining items after removing one', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await productsPage.addToCart(PRODUCTS.ONESIE.slug);
    await expect(productsPage.cartBadge).toHaveText('3');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(3);
    await cartPage.removeItem(PRODUCTS.BIKE_LIGHT.slug);
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.BACKPACK.name })).toBeVisible();
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.ONESIE.name })).toBeVisible();
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.BIKE_LIGHT.name })).not.toBeVisible();
  });

  // ── Navigation ───────────────────────────────

  test('should navigate back to products via Continue Shopping', async ({ page }) => {
    await goToCartAndWait(page);
    await expect(cartPage.title).toHaveText('Your Cart');
    await cartPage.continueShopping();
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  test('should navigate to checkout step one', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await expect(productsPage.cartBadge).toHaveText('1');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.checkout();
    await expect(page).toHaveURL(URLS.CHECKOUT_STEP_ONE);
  });

  // ── Persistence ──────────────────────────────

  test('should persist cart items after navigating away and back', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.FLEECE_JACKET.slug);
    await productsPage.addToCart(PRODUCTS.BOLT_TSHIRT.slug);
    await expect(productsPage.cartBadge).toHaveText('2');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(2);
    await cartPage.continueShopping();
    await expect(productsPage.inventoryItems).toHaveCount(TOTAL_PRODUCTS);
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.FLEECE_JACKET.name })).toBeVisible();
    await expect(cartPage.cartItemNames.filter({ hasText: PRODUCTS.BOLT_TSHIRT.name })).toBeVisible();
  });

  test('should update cart badge to match cart item count', async ({ page }) => {
    await productsPage.addToCart(PRODUCTS.BACKPACK.slug);
    await productsPage.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await expect(productsPage.cartBadge).toHaveText('2');
    await goToCartAndWait(page);
    await expect(cartPage.cartItems).toHaveCount(2);
  });
});
