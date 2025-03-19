# Cypress Utility Functions

This directory contains utility functions that support the Cypress tests.

## String Utilities

### File Name Sanitization

The `stringUtils.js` file contains a utility function for sanitizing strings to make them safe for use in file names:

```javascript
const { sanitizeForFileName } = require('./stringUtils.js');

// Examples:
const safeBrandName = sanitizeForFileName("H&M Brand");      // "h-m-brand"
const safePageType = sanitizeForFileName("Product.Page");    // "product-page"
const safeFileName = sanitizeForFileName("Test/File: v1.0"); // "test-file-v1-0"
```

#### Implementation Details

The `sanitizeForFileName` function performs the following transformations:

1. **Converts to lowercase**
   
   ```javascript
   const lowerStr = str.toLowerCase();
   ```

2. **Replaces special characters with hyphens**
   
   ```javascript
   // Matches any character that is not a letter, number, or hyphen
   return lowerStr.replace(/[^a-z0-9-]/g, '-')
   ```

3. **Consolidates consecutive hyphens**
   
   ```javascript
   // Replaces multiple consecutive hyphens with a single one
   .replace(/-+/g, '-')
   ```

4. **Removes leading and trailing hyphens**
   
   ```javascript
   // Removes hyphens at the beginning or end of the string
   .replace(/^-+|-+$/g, '');
   ```

#### Why This Is Important

File system paths can be problematic when they contain certain characters, and different operating systems have different restrictions. This utility ensures that generated filenames:

1. Are consistent across all operating systems
2. Don't contain characters that might cause problems (like spaces, slashes, colons)
3. Are formatted in a readable way

#### Use Cases

This utility is particularly useful for:

1. **Visual Regression Testing**
   - When creating screenshot files based on brand names and page types
   - When creating difference images between versions

2. **Report Generation**
   - When creating report files with brand or page type in the filename

3. **Test Artifacts**
   - When saving logs or other outputs with user-provided names

#### Extension Points

If you need to customize the sanitization process, you can modify the regex patterns in `stringUtils.js`. For example:

- To allow uppercase letters: Change `[^a-z0-9-]` to `[^a-zA-Z0-9-]`
- To replace with underscores instead of hyphens: Change the replacement from `-` to `_`
- To allow additional characters: Add them to the character class in the regex

#### Examples of Sanitized Strings

| Original String           | Sanitized Result        |
|---------------------------|-------------------------|
| `H&M Brand`               | `h-m-brand`             |
| `Product.Page`            | `product-page`          |
| `Category/Subcategory`    | `category-subcategory`  |
| `Test File: v1.0`         | `test-file-v1-0`        |
| `--Special--Case--`       | `special-case`          |
| `MixedCASE & symbols!`    | `mixedcase-symbols`     |
``` 