# Visual Regression Test Implementation

This document explains the implementation details of the visual regression tests in this directory.

## Test Files

| File | Purpose |
|------|---------|
| `regression.cy.js` | Main test that compares screenshots across all viewports (desktop, tablet, mobile) |
| `regression-desktop.cy.js` | Test specific to desktop viewport (1280x800) |
| `regression-tablet.cy.js` | Test specific to tablet viewport (768x1024) |
| `regression-mobile.cy.js` | Test specific to mobile viewport (375x667) |

## Key Components

### Viewport Definitions

```javascript
const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];
```

### Thresholds

Each viewport has a specific threshold for acceptable differences:

```javascript
const thresholds = {
  desktop: 0.05, // 5%
  tablet: 0.1,   // 10%
  mobile: 0.05,  // 5%
};
```

### Wait Times

Different viewports may require different wait times to ensure all content is loaded:

```javascript
const waitTimes = {
  desktop: 5000, // 5 seconds
  tablet: 8000,  // 8 seconds
  mobile: 5000,  // 5 seconds
};
```

## File Name Sanitization

The tests use the `sanitizeForFileName` utility to ensure valid file names regardless of the brand or page type:

```javascript
const { sanitizeForFileName } = require('../support/utils/stringUtils.js');

// Later in the test:
const sanitizedBrand = sanitizeForFileName(brand);
const sanitizedPageType = sanitizeForFileName(pageType);
const baseName = `${sanitizedBrand}-${sanitizedPageType}-${viewport.name}`;
```

This ensures:
- Special characters are handled properly
- File names are consistent and valid across operating systems
- No issues with spaces or other problematic characters

## Handling Sticky Headers

Sticky headers can appear multiple times in full-page screenshots. To prevent this, we use a CSS-based approach:

```javascript
// Hide any sticky headers before taking screenshots
cy.window().then((win) => {
  // Find and temporarily hide sticky elements (headers, fixed and sticky elements)
  const headerTag = win.document.body.querySelector('header');
  if (headerTag) {
    headerTag.style.position = 'relative';
    headerTag.style.height = 0;
  }
});

// Take the screenshot
cy.screenshot(`original-${baseName}`, { capture: 'fullPage' });

// Restore sticky elements
cy.window().then((win) => {
  const headerTag = win.document.body.querySelector('header');
  if (headerTag) {
    // remove the style
    headerTag.removeAttribute('style');
  }
});
```

This approach:
- Works for all types of sticky/fixed elements, not just headers
- Is more reliable than targeting specific DOM elements
- Ensures consistent screenshots across viewports

## Pre-scrolling Technique

To ensure all lazy-loaded images are visible before taking screenshots:

```javascript
// Pre-scroll the page to trigger lazy loading of images
cy.scrollTo('bottom', { duration: 1000 });
cy.wait(2000); // Wait for images to load after scrolling
cy.scrollTo('top', { duration: 500 });
cy.wait(2000); // Final wait before taking screenshot
```

## Cross-origin Support

The tests use `cy.origin()` to handle screenshots from different domains:

```javascript
cy.origin(
  baseUrl2,
  { args: originArgs },
  ({ baseName: nameFromOrigin, baseUrl2: url2, waitTime }) => {
    // Test code for second URL
  }
);
```

## Screenshot Comparison

The comparison is performed using custom tasks:

```javascript
cy.task('compareScreenshots', {
  name: baseName,
  screenshotPath,
  threshold: thresholds[name], // Use the viewport-specific threshold
}).then((result) => {
  if (!result.success) {
    cy.log(`Mismatch detected: ${result.mismatch}% difference`);
    cy.log(`Diff saved at: ${result.diffImage}`);
    cy.wrap(result.success).should('be.true');
  } else {
    cy.log('Screenshots match within threshold.');
    cy.wrap(result.success).should('be.true');
  }
});
```

## Modifying Tests

### Changing Viewport Sizes

If you need to test different viewport sizes, modify the viewport definitions in each test file.

### Adjusting Thresholds

For less or more strict comparison, adjust the threshold values:

```javascript
const thresholds = {
  desktop: 0.03, // More strict: 3%
  tablet: 0.15,  // Less strict: 15%
  mobile: 0.05,  // Unchanged: 5%
};
```