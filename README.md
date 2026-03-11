# E-Commerce Test Automation Suite

![CI Status](paste your Actions badge here)

A professional end-to-end test automation framework built with Playwright and 
TypeScript, covering critical e-commerce user flows with cross-browser execution, 
CI/CD integration, and Allure reporting.

---

## Tech Stack

- **Playwright** — test automation framework
- **TypeScript** — language
- **GitHub Actions** — CI/CD pipeline
- **Allure** — test reporting
- **Node.js** — runtime

---

## What's Being Tested

- Login (valid credentials, invalid credentials, locked user)
- Product listing and sorting
- Add to cart / remove from cart
- Full checkout flow end to end
- Cross-browser: Chromium, Firefox, WebKit

---

## Project Structure
```
├── tests/          # test spec files
├── pages/          # Page Object Model classes
├── utils/          # test data and helpers
├── .github/        # GitHub Actions workflow
└── playwright.config.ts
```

---

## How to Run Locally

Clone the repo:
git clone https://github.com/aadit-stack/ecommerce-playwright-suite.git

Install dependencies:
npm install

Install browsers:
npx playwright install

Run all tests:
npx playwright test

Run in UI mode (visual, great for debugging):
npx playwright test --ui

Run on a specific browser only:
npx playwright test --project=chromium

Generate Allure report:
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report

---

## CI/CD Pipeline

Tests run automatically on every push via GitHub Actions across 
Chromium, Firefox, and WebKit in parallel. Allure report is 
published to GitHub Pages. Slack notification fires on failure.

---

## Sample Report

Allure report here)