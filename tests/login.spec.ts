import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {
  USERS,
  PASSWORD,
  INVALID_PASSWORD,
  INVALID_USERNAME,
  LOGIN_ERRORS,
  URLS,
  PAGE_TITLE,
} from '../utils/testData';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ── Positive Tests ───────────────────────────

  test('should login successfully with standard_user', async ({ page }) => {
    await loginPage.login(USERS.STANDARD, PASSWORD);
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  test('should login successfully with performance_glitch_user', async ({ page }) => {
    await loginPage.login(USERS.PERFORMANCE_GLITCH, PASSWORD);
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  test('should login successfully with visual_user', async ({ page }) => {
    await loginPage.login(USERS.VISUAL, PASSWORD);
    await expect(page).toHaveURL(URLS.INVENTORY);
  });

  // ── Negative Tests ───────────────────────────

  test('should show error for locked_out_user', async () => {
    await loginPage.login(USERS.LOCKED_OUT, PASSWORD);
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('locked out');
  });

  test('should show error when username is empty', async () => {
    await loginPage.login('', PASSWORD);
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(LOGIN_ERRORS.USERNAME_REQUIRED);
  });

  test('should show error when password is empty', async () => {
    await loginPage.login(USERS.STANDARD, '');
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(LOGIN_ERRORS.PASSWORD_REQUIRED);
  });

  test('should show username required when both fields empty', async () => {
    await loginPage.login('', '');
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(LOGIN_ERRORS.USERNAME_REQUIRED);
  });

  test('should show error for invalid username', async () => {
    await loginPage.login(INVALID_USERNAME, PASSWORD);
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(LOGIN_ERRORS.CREDENTIALS_MISMATCH);
  });

  test('should show error for invalid password', async () => {
    await loginPage.login(USERS.STANDARD, INVALID_PASSWORD);
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(LOGIN_ERRORS.CREDENTIALS_MISMATCH);
  });

  test('should show error for both invalid credentials', async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(LOGIN_ERRORS.CREDENTIALS_MISMATCH);
  });

  // ── UI / Accessibility Tests ─────────────────

  test('should display the page title "Swag Labs"', async ({ page }) => {
    await expect(page).toHaveTitle(PAGE_TITLE);
  });

  test('should have a visible login button', async () => {
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should have correct username placeholder', async () => {
    await expect(loginPage.usernameInput).toHaveAttribute('placeholder', 'Username');
  });

  test('should have correct password placeholder', async () => {
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Password');
  });

  test('should display error message container when login fails', async () => {
    await loginPage.login('', '');
    expect(await loginPage.isErrorVisible()).toBe(true);
  });
});
