/* eslint-disable no-undef */
const { sanitizeForFileName } = require('../support/utils/stringUtils.js');

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

// Define thresholds for each viewport
const thresholds = {
  desktop: 0.05,
  tablet: 0.1,
  mobile: 0.05,
};

// Define wait times based on viewport
const waitTimes = {
  desktop: 5000,
  tablet: 8000,
  mobile: 5000,
};

before(() => {
  // Get environment variables early so we can use them for screenshot clearing
  const brand = Cypress.env('Brandcode');
  const pageType = Cypress.env('PageType');

  // Loop through each viewport and clear screenshots for each one separately
  viewports.forEach((viewport) => {
    cy.task('clearScreenshots', {
      specName: Cypress.spec.name,
      viewport: viewport.name,
      brand,
      pageType,
    });
  });
});

describe('Compare Screenshots Between Two URLs', () => {
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err) => {
      console.warn('Ignoring uncaught exception in test:', err.message);
      return false;
    });
  });

  it('Sanity check', () => {
    cy.wrap(null).then(() => {
      console.log('Cypress is loaded!');
    });
  });

  const baseUrl1 = Cypress.env('URL_1');
  const baseUrl2 = Cypress.env('URL_2');
  const brand = Cypress.env('Brandcode');
  const pageType = Cypress.env('PageType');

  if (!baseUrl1 || !baseUrl2) {
    throw new Error('❌ Environment variables URL_1 and URL_2 are required.');
  }

  viewports.forEach(({ name, width, height }) => {
    it(`Compares screenshots for ${name} viewport`, () => {
      cy.viewport(width, height);
      cy.log(`🔍 Comparing screenshots between ${baseUrl1} and ${baseUrl2} for ${brand}, page type: ${pageType} for viewport ${width}/${height}`);

      // Sanitize brand and pageType for file names
      const sanitizedBrand = sanitizeForFileName(brand);
      const sanitizedPageType = sanitizeForFileName(pageType);
      const baseName = `${sanitizedBrand}-${sanitizedPageType}-${name}`;

      // Create subdirectory for screenshots
      cy.task('createCompareDir', Cypress.spec.name);

      // Visit first URL and take a screenshot
      cy.visit(baseUrl1);
      cy.wait(waitTimes[name]); // Use viewport-specific wait time
      cy.get('body').should('be.visible');

      // Pre-scroll the page to trigger lazy loading of images
      cy.scrollTo('bottom', { duration: 1000, ensureScrollable: false });
      cy.wait(2000); // Wait for images to load after scrolling
      cy.scrollTo('top', { duration: 500, ensureScrollable: false });
      cy.wait(2000); // Final wait before taking screenshot

      // Hide any sticky headers to prevent them from appearing multiple times
      cy.window().then((win) => {
        // Find and temporarily hide sticky elements (typically headers)
        if (name !== 'desktop') {
          const headerTag = win.document.body.querySelector('header');
          if (headerTag) {
            headerTag.style.position = 'relative';
            headerTag.style.height = 0;
          }
        }
        
        // Hide scrollbars for all viewports to ensure consistency
        const style = win.document.createElement('style');
        style.id = 'hide-scrollbars';
        style.textContent = `
          html, body {
            overflow: hidden !important;
            overflow-x: hidden !important;
            overflow-y: hidden !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `;
        win.document.head.appendChild(style);
      });

      // Take a screenshot with the fullPage option
      cy.screenshot(`original-${baseName}`, { capture: 'fullPage' });

      // Restore sticky elements
      cy.window().then((win) => {
        if (name !== 'desktop') {
          const headerTag = win.document.body.querySelector('header');
          if (headerTag) {
            // remove the style
            headerTag.removeAttribute('style');
          }
        }
        
        // Remove the scrollbar hiding styles
        const style = win.document.getElementById('hide-scrollbars');
        if (style) {
          style.remove();
        }
      });

      // Create an args object with all the variables needed in origin
      const originArgs = { baseName, baseUrl2, waitTime: waitTimes[name] };

      cy.origin(
        baseUrl2,
        { args: originArgs },
        ({ baseName: nameFromOrigin, baseUrl2: url2, waitTime }) => {
          // Exception handling inside cy.origin()
          Cypress.on('uncaught:exception', () => false);

          // Navigate to URL 2
          cy.visit(url2);

          // Wait to ensure the page is fully loaded
          cy.wait(waitTime); // Use viewport-specific wait time
          cy.get('body').should('be.visible');

          // Pre-scroll the page to trigger lazy loading of images
          cy.scrollTo('bottom', { duration: 1000 });
          cy.wait(2000); // Wait for images to load after scrolling
          cy.scrollTo('top', { duration: 500 });
          cy.wait(2000); // Final wait before taking screenshot

          // Hide any sticky headers to prevent them from appearing multiple times
          cy.window().then((win) => {
            // Find and temporarily hide sticky elements (typically headers)
            if (name !== 'desktop') {
              const headerTag = win.document.body.querySelector('header');
              if (headerTag) {
                headerTag.style.position = 'relative';
                headerTag.style.height = 0;
              }
            }
            
            // Hide scrollbars for all viewports to ensure consistency
            const style = win.document.createElement('style');
            style.id = 'hide-scrollbars';
            style.textContent = `
              html, body {
                overflow: hidden !important;
                overflow-x: hidden !important;
                overflow-y: hidden !important;
              }
              ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
            `;
            win.document.head.appendChild(style);
          });

          // Take a screenshot with the fullPage option
          cy.screenshot(`modified-${nameFromOrigin}`, { capture: 'fullPage' });

          // Restore sticky elements
          cy.window().then((win) => {
            if (name !== 'desktop') {
              const headerTag = win.document.body.querySelector('header');
              if (headerTag) {
                // remove the style
                headerTag.removeAttribute('style');
              }
            }
            
            // Remove the scrollbar hiding styles
            const style = win.document.getElementById('hide-scrollbars');
            if (style) {
              style.remove();
            }
          });
        },
      );

      // Get the screenshot path for the current spec
      cy.task('getScreenshotPath', Cypress.spec.name).then((screenshotPath) => {
        cy.log(`Dynamic Screenshot Path: ${screenshotPath}`);

        cy.task('compareScreenshots', {
          name: baseName,
          screenshotPath,
          threshold: thresholds[name], // Use the viewport-specific threshold values
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
      });
    });
  });
});
