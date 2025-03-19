# Cypress Visual Regression Tests

This folder contains Cypress-based visual regression tests for comparing screenshots between two versions of a website. These tests are designed to identify visual differences between pages across different viewport sizes.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Special Features](#special-features)
  - [Screenshot Sanitization](#screenshot-sanitization)
  - [Handling Sticky Headers](#handling-sticky-headers)
  - [Viewport-Specific Configurations](#viewport-specific-configurations)
- [Test Files](#test-files)
- [Custom Tasks](#custom-tasks)
- [Troubleshooting](#troubleshooting)

## Overview

The visual regression tests work by:

1. Taking screenshots of pages from two different URLs (e.g., a baseline and a modified version)
2. Comparing these screenshots to detect visual differences
3. Reporting differences that exceed a configurable threshold

This is particularly useful for verifying that UI changes or code refactoring don't inadvertently alter the appearance of pages.

## Test Structure

Each test follows this workflow:

1. Configure viewport dimensions (desktop, tablet, or mobile)
2. Visit the baseline URL and take a screenshot
3. Visit the modified URL and take a screenshot
4. Compare the two screenshots and report differences

The tests include pre-scrolling techniques to ensure all lazy-loaded images are fully loaded before taking screenshots.

## Environment Variables

The tests require the following environment variables:

- `Brandcode`: The brand identifier (e.g., "hm")
- `PageType`: The type of page being tested (e.g., "home", "product", "category")
- `URL_1`: The baseline URL to compare from
- `URL_2`: The modified URL to compare against

Example:

```bash
npx cypress run --env Brandcode="H&M",PageType="HomePage",URL_1="https://baseline-site.com",URL_2="https://modified-site.com"
```

## Running Tests

### Run All Tests

```bash
npx cypress run
```

### Run Tests for a Specific Viewport

```bash
# Desktop Only
npx cypress run --spec cypress/e2e/regression-desktop.cy.js

# Tablet Only
npx cypress run --spec cypress/e2e/regression-tablet.cy.js

# Mobile Only
npx cypress run --spec cypress/e2e/regression-mobile.cy.js
```

### Run Tests with Specific Environment Variables

```bash
npx cypress run --env Brandcode="H&M",PageType="ProductPage",URL_1="https://example.com/v1",URL_2="https://example.com/v2"
```

### Run Tests in Headed Mode (to see browser)

```bash
npx cypress run --headed
```

## Special Features

### Screenshot Sanitization

The tests use a string sanitization utility to handle brand and page type names that contain special characters. This ensures valid file names regardless of input:

- Spaces, dots, ampersands, and other special characters are replaced with hyphens
- All text is converted to lowercase
- Consecutive hyphens are consolidated
- Leading and trailing hyphens are removed

For example:
- `H&M Brand` becomes `h-m-brand`
- `Product.Page` becomes `product-page`
- `Sub Category/Test` becomes `sub-category-test`

### Handling Sticky Headers

The tests include a technique to prevent sticky headers from appearing multiple times in full-page screenshots:

1. Before taking a screenshot, the tests inject CSS to temporarily change the positioning of sticky elements to `position: absolute`
2. After the screenshot is taken, the CSS is removed to restore the original styling

This ensures clean, accurate screenshots without duplicated headers.

### Viewport-Specific Configurations

Different viewports have tailored configurations:

| Viewport | Dimensions      | Default Threshold | Wait Time |
|----------|-----------------|-------------------|-----------|
| Desktop  | 1280x800 px     | 5%                | 5000 ms   |
| Tablet   | 768x1024 px     | 10%               | 8000 ms   |
| Mobile   | 375x667 px      | 5%                | 5000 ms   |

These values ensure optimal test accuracy for each device type.

## Test Files

- `regression.cy.js`: Comprehensive test that runs comparisons for all viewports (desktop, tablet, mobile)
- `regression-desktop.cy.js`: Test specifically for desktop viewport
- `regression-tablet.cy.js`: Test specifically for tablet viewport
- `regression-mobile.cy.js`: Test specifically for mobile viewport

## Custom Tasks

The tests use several custom Cypress tasks:

- `createCompareDir`: Creates a directory for storing comparison screenshots
- `clearScreenshots`: Cleans up previous screenshots for the current test
- `getScreenshotPath`: Retrieves the path to the screenshot directory
- `compareScreenshots`: Compares two screenshots and reports the difference percentage

These tasks are defined in `cypress/config/tasks.js`.

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   
   Error: `Environment variables URL_1 and URL_2 are required`
   
   Solution: Make sure to set the required environment variables when running tests:
   ```bash
   npx cypress run --env URL_1=https://example.com/v1,URL_2=https://example.com/v2,Brandcode=brand,PageType=home
   ```

2. **Scrolling Issues**
   
   Error: `Timed out retrying after 10000ms: cy.scrollTo() failed because this element is not scrollable`
   
   Solution: This usually occurs when the page is not fully loaded or has a non-standard layout. Try:
   - Increasing the wait time before scrolling
   - Adding `{ ensureScrollable: false }` to the scrollTo options

3. **High Mismatch Percentages**
   
   Issue: Tests fail with high mismatch percentages
   
   Solution:
   - Increase viewport-specific wait times to ensure all images are fully loaded
   - Adjust the threshold values for specific viewports
   - Check for dynamic content (like carousels or animations) that might cause differences 