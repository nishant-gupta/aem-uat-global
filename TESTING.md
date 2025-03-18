# Visual Regression Testing Guide

This document explains the visual regression testing approach for this project, which is designed to detect unexpected visual changes between different versions of the site.

## Overview

The testing suite uses Cypress to capture screenshots of pages in different environments and compares them to identify visual differences. This is particularly useful for:

- Validating that UI changes don't have unintended side effects
- Ensuring consistent appearance across different viewports (desktop, tablet, mobile)
- Detecting rendering issues during development or deployment

## Key Features

- **Multi-viewport Testing**: Tests run on desktop, tablet, and mobile dimensions
- **Cross-domain Support**: Can compare URLs from different domains or environments
- **Sticky Header Management**: Special handling for sticky elements to avoid duplication in screenshots
- **Robust File Handling**: Sanitization for brand and page type names to ensure valid file names
- **Configurable Thresholds**: Different tolerance levels can be set for different viewports

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Cypress (v10+)

## Running Tests

### Basic Usage

Run all tests:

```bash
npx cypress run
```

Run tests for a specific file:

```bash
npx cypress run --spec cypress/e2e/regression-desktop.cy.js
```

### Required Environment Variables

```bash
npx cypress run --env Brandcode="BrandName",PageType="PageType",URL_1="https://baseline-url.com",URL_2="https://comparison-url.com"
```

## Test Structure

Each test:

1. Visits the baseline URL and takes a screenshot
2. Visits the comparison URL and takes a screenshot
3. Compares the screenshots and reports differences

## Test Files

```
cypress/
├── e2e/
│   ├── regression.cy.js         # Tests all viewports
│   ├── regression-desktop.cy.js # Desktop-specific tests
│   ├── regression-tablet.cy.js  # Tablet-specific tests
│   └── regression-mobile.cy.js  # Mobile-specific tests
├── support/
│   └── utils/
│       └── stringUtils.js       # Utilities for sanitizing file names
└── config/
    └── tasks.js                 # Custom Cypress tasks for screenshot operations
```

## Screenshot Process

1. **Preparation**: Sets the viewport size and clears existing screenshots
2. **Page Loading**: Visits the URL and waits for a viewport-specific time
3. **Pre-scrolling**: Scrolls the page to trigger lazy loading of images
4. **Sticky Header Handling**: Temporarily modifies sticky element styling
5. **Screenshot Capture**: Takes a full-page screenshot
6. **Restoration**: Restores original styles for sticky elements
7. **Comparison**: Compares screenshots and calculates mismatch percentage

## Customizing Tests

### Modifying Viewport Sizes

In each test file, adjust the viewport definitions:

```javascript
const viewport = { name: 'desktop', width: 1440, height: 900 };
```

### Adjusting Thresholds

Change the acceptable difference percentage:

```javascript
const thresholds = {
  desktop: 0.03, // 3% for desktop
  tablet: 0.08,  // 8% for tablet
  mobile: 0.05,  // 5% for mobile
};
```

### Changing Wait Times

Increase or decrease wait times for page loading:

```javascript
const waitTimes = {
  desktop: 3000, // 3 seconds for desktop
  tablet: 5000,  // 5 seconds for tablet
  mobile: 4000,  // 4 seconds for mobile
};
```

## Best Practices

1. **Set Appropriate Thresholds**: Different viewports may need different thresholds
2. **Use Consistent Test Data**: Ensure test data is consistent between environments
3. **Account for Dynamic Content**: Be aware of content that changes (like dates, carousels)
4. **Regular Baseline Updates**: Update baselines when intentional UI changes are made
5. **CI Integration**: Integrate tests into your CI/CD pipeline

## Troubleshooting

### Common Issues

- **High Mismatch Percentages**: May indicate that images or content aren't fully loaded
- **Scrolling Errors**: Check that the page is scrollable and fully loaded
- **Missing Screenshots**: Verify environment variables and file paths
- **Cross-origin Failures**: Check that cookies and authentication are handled correctly

### Debugging Tips

- Run tests with `--headed` flag to see the browser during test execution
- Increase wait times for problematic viewports
- Check browser console for JavaScript errors
- Examine generated screenshots manually for obvious issues

## Future Improvements

- Integration with visual diffing tools for more detailed reports
- Automated baseline updates for approved changes
- AI-based filtering of insignificant visual differences 