import { type Locator, type Page } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItemPrices: Locator;
  readonly inventoryItemImages: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly allItemsLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly closeMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.inventoryItemNames = page.locator('[data-test="inventory-item-name"]');
    this.inventoryItemPrices = page.locator('[data-test="inventory-item-price"]');
    this.inventoryItemImages = page.locator('img.inventory_item_img');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
  }

  async getProductNames(): Promise<string[]> {
    return this.inventoryItemNames.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItemPrices.allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }

  async getProductCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async sortBy(option: string) {
    await this.sortDropdown.selectOption(option);
  }

  private toKebabCase(name: string): string {
    return name
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-');
  }

  async addToCart(productName: string) {
    const kebab = this.toKebabCase(productName);
    await this.page.locator(`[data-test="add-to-cart-${kebab}"]`).click();
  }

  async removeFromCart(productName: string) {
    const kebab = this.toKebabCase(productName);
    await this.page.locator(`[data-test="remove-${kebab}"]`).click();
  }

  async getCartBadgeCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.cartBadge.isVisible();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async openMenu() {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenuButton.click();
  }

  async clickProductName(productName: string) {
    await this.inventoryItemNames.filter({ hasText: productName }).first().click();
  }
}
