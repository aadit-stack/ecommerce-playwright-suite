import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly cartItemQuantities: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.cartItemNames = page.locator('[data-test="inventory-item-name"]');
    this.cartItemPrices = page.locator('[data-test="inventory-item-price"]');
    this.cartItemQuantities = page.locator('[data-test="item-quantity"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.title = page.locator('[data-test="title"]');
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartItemNames.allTextContents();
  }

  async getCartItemPrices(): Promise<number[]> {
    const priceTexts = await this.cartItemPrices.allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async removeItem(productName: string) {
    const kebab = productName
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-');
    await this.page.locator(`[data-test="remove-${kebab}"]`).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async isCartEmpty(): Promise<boolean> {
    return (await this.cartItems.count()) === 0;
  }
}
