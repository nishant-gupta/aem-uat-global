# Cypress Utility Functions

This directory contains utility functions used across Cypress tests.

## String Utilities

### sanitizeForFileName(str)

This function sanitizes a string to make it safe for use in file names:

- Converts the string to lowercase
- Removes special characters (spaces, dots, ampersands, etc.)
- Replaces them with hyphens
- Eliminates consecutive and trailing hyphens

#### Example:

```javascript
const { sanitizeForFileName } = require('./stringUtils.js');

// "H&M Brand" becomes "h-m-brand"
const safeBrandName = sanitizeForFileName("H&M Brand");

// "Product.Page" becomes "product-page"
const safePageType = sanitizeForFileName("Product.Page");

// "Sub Category/Test" becomes "sub-category-test"
const safeCategoryName = sanitizeForFileName("Sub Category/Test");
```

This is particularly useful for creating file names for screenshots that work reliably across different operating systems, regardless of what special characters are in the brand names or page types. 