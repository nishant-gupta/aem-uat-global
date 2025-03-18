/**
 * Sanitizes a string to make it safe for file names
 * - Converts to lowercase
 * - Removes special characters (like spaces, dots, &, etc.)
 * - Replaces them with hyphens
 *
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
function sanitizeForFileName(str) {
  if (!str) return '';

  // Convert to lowercase
  const lowerStr = str.toLowerCase();

  // Replace special characters with hyphens
  // This regex matches any character that is not a letter, number, or hyphen
  return lowerStr.replace(/[^a-z0-9-]/g, '-')
    // Replace multiple consecutive hyphens with a single one
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

module.exports = {
  sanitizeForFileName,
};
