// Cypress task definitions
const fs = require('fs-extra');
const path = require('path');
const { sanitizeForFileName } = require('../support/utils/stringUtils.js');

/**
 * Define Cypress custom tasks
 * @param {Object} on - Cypress events
 */
module.exports = (on) => {
  on('task', {
    /**
     * Create a compare directory for a given spec
     * @param {string} specName - The name of the current spec file
     * @returns {boolean} Success status
     */
    createCompareDir(specName) {
      const screenshotsDir = path.join(__dirname, '../screenshots');
      const specDir = path.join(screenshotsDir, specName);
      const compareDir = path.join(specDir, 'compare');

      if (!fs.existsSync(compareDir)) {
        fs.mkdirpSync(compareDir);
        console.log(`Created compare directory: ${compareDir}`);
      } else {
        console.log(`Compare directory already exists: ${compareDir}`);
      }

      return true;
    },

    /**
     * Clear screenshots matching the current spec and viewport
     * @param {Object} options - The options for clearing screenshots
     * @param {string} options.specName - The name of the current spec file
     * @param {string} options.viewport - The viewport name (desktop, tablet, mobile)
     * @param {string} options.brand - The brand code
     * @param {string} options.pageType - The page type
     * @returns {null}
     */
    clearScreenshots( { specName, viewport, brand, pageType } ) {
      const screenshotsDir = path.join(__dirname, '../screenshots');
      const compareDir = path.join(screenshotsDir, specName, 'compare');

      // Sanitize brand and pageType for file names
      const sanitizedBrand = sanitizeForFileName(brand);
      const sanitizedPageType = sanitizeForFileName(pageType);

      // Create base pattern for matching files
      const basePattern = sanitizedBrand && sanitizedPageType
        ? `-${sanitizedBrand}-${sanitizedPageType}-${viewport}`
        : `-${viewport}`;

      console.log(`Deleting screenshots for viewport: ${viewport} with pattern: *${basePattern}*.png`);

      if (fs.existsSync(compareDir)) {
        // Get all files in the compare directory
        const files = fs.readdirSync(compareDir);

        // Filter and delete files that match the pattern
        files.filter((file) => file.includes(basePattern) && file.endsWith('.png'))
          .forEach((file) => {
            const filePath = path.join(compareDir, file);
            console.log(`Deleting file: ${filePath}`);
            fs.removeSync(filePath);
          });
      } else {
        // Create the directory if it doesn't exist
        fs.mkdirpSync(compareDir);
        console.log(`Created directory: ${compareDir}`);
      }

      return null;
    },

    /**
     * Get the path to the screenshots directory
     * @param {string} specName - The name of the current spec file
     * @returns {string} Path to the screenshots directory
     */
    getScreenshotPath(specName) {
      const screenshotsDir = path.join(__dirname, '../screenshots');
      const fullPath = path.join(screenshotsDir, specName);
      console.log(`Generated screenshot path: ${fullPath}`);
      console.log(`__dirname: ${__dirname}`);
      // List directories to help debug
      console.log('Files at screenshot path:');
      if (fs.existsSync(fullPath)) {
        fs.readdirSync(fullPath).forEach((file) => {
          console.log(`  - ${file}`);
        });
      }
      return fullPath;
    },

    /**
     * Compare screenshots
     * @param {Object} options - The options for comparing screenshots
     * @param {string} options.name - The base name for screenshots
     * @param {string} options.screenshotPath - The path to the screenshots directory
     * @param {number} options.threshold - The threshold for comparison (0-1)
     * @returns {Object} Comparison result
     */
    compareScreenshots({ name, screenshotPath, threshold = 0.1 }) {
      // Add the compare directory
      const compareDir = path.join(screenshotPath, 'compare');
      console.log(`Compare directory path: ${compareDir}`);

      // Log all files in the directory
      if (fs.existsSync(compareDir)) {
        console.log('Files in compare directory:');
        fs.readdirSync(compareDir).forEach((file) => {
          console.log(` - ${file}`);
        });
      } else {
        console.log(`Compare directory does not exist: ${compareDir}`);
      }

      const original = path.join(screenshotPath, `original-${name}.png`);
      const modified = path.join(screenshotPath, `modified-${name}.png`);
      const diffOutput = path.join(screenshotPath, `diff-${name}.png`);

      console.log('Comparing screenshots:', original, modified);

      if (!fs.existsSync(original) || !fs.existsSync(modified)) {
        console.log('One or both screenshot files do not exist:', original, modified);
        return { success: false, error: 'Baseline or modified image missing' };
      }

      // Use resemblejs to compare the images
      const resemble = require('resemblejs');
      return new Promise((resolve) => {
        resemble(original)
          .compareTo(modified)
          .ignoreLess() // Ignores colors (optional)
          .onComplete((data) => {
            const misMatchPercentage = parseFloat(data.misMatchPercentage);
            console.log(`Mismatch: ${misMatchPercentage}%`);

            if (misMatchPercentage > threshold * 100) {
              // Save diff image
              fs.writeFileSync(diffOutput, data.getBuffer());
              console.log(`Diff image saved at: ${diffOutput}`);
              console.log(`❌ Test failed: Mismatch ${misMatchPercentage}% is above threshold ${threshold * 100}%`);

              resolve({ success: false, diffImage: diffOutput, mismatch: misMatchPercentage });
            } else {
              fs.writeFileSync(diffOutput, data.getBuffer());
              console.log(`✅ Test passed: Mismatch ${misMatchPercentage}% is below threshold ${threshold * 100}%`);

              resolve({ success: true, mismatch: misMatchPercentage });
            }
          });
      });
    },
  });
};
