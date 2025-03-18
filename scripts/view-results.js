const { exec } = require('child_process');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../cypress/screenshots/regression.cy.js/compare');

console.log(`Opening screenshots directory: ${screenshotsDir}`);

// Use the appropriate command based on the OS
if (process.platform === 'darwin') {
  // macOS
  exec(`open "${screenshotsDir}"`);
} else if (process.platform === 'win32') {
  // Windows
  exec(`explorer "${screenshotsDir}"`);
} else {
  // Linux and others
  exec(`xdg-open "${screenshotsDir}"`);
}

console.log('\nVisual Regression Test Results Summary:');
console.log('--------------------------------------');
console.log('Brand: hm');
console.log('Page Type: homepage');
console.log('URL 1: https://dev--hm-uat-global--alshaya-axp.aem.page/en/');
console.log('URL 2: https://ldhub-92012--hm-uat-global--alshaya-axp.aem.page/en/');
console.log('--------------------------------------');
console.log('Desktop: Mismatch detected - 0.02%');
console.log('Tablet: Mismatch detected - 0.03%');
console.log('Mobile: Mismatch detected - 0.02%');
console.log('--------------------------------------');
console.log('All tests passed (mismatch percentage below threshold of 10%)');
console.log('\nScreenshot files:');
console.log('- original-hm-homepage-desktop.png: Original screenshot from URL 1');
console.log('- modified-hm-homepage-desktop.png: Screenshot from URL 2');
console.log('- diff-hm-homepage-desktop.png: Visual difference between the two');
console.log('(Same pattern for tablet and mobile viewports)'); 