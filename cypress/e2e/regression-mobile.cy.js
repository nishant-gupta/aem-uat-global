/* eslint-disable no-undef */
const { sanitizeForFileName } = require('../support/utils/stringUtils.js');

const viewport = { name: 'mobile', width: 375, height: 667 };

before(() => {
  // Get environment variables early so we can use them for screenshot clearing
  const brand = Cypress.env('Brandcode');
  const pageType = Cypress.env('PageType');

  // Clear only screenshots for this viewport
  cy.task('clearScreenshots', {
    specName: Cypress.spec.name,
    viewport: viewport.name,
    brand,
    pageType,
  });
});

describe('Compare Screenshots Between Two URLs - Mobile', () => {
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err) => {
      console.warn('Ignoring uncaught exception in test:', err.message);
      return false;
    });
  });

  const baseUrl1 = Cypress.env('URL_1');
  const baseUrl2 = Cypress.env('URL_2');
  const brand = Cypress.env('Brandcode');
  const pageType = Cypress.env('PageType');

  if (!baseUrl1 || !baseUrl2) {
    throw new Error('❌ Environment variables URL_1 and URL_2 are required.');
  }

  it('Compares screenshots for mobile viewport', () => {
    cy.viewport(viewport.width, viewport.height);
    cy.log(`🔍 Comparing screenshots between ${baseUrl1} and ${baseUrl2} for ${brand}, page type: ${pageType} for viewport ${viewport.width}/${viewport.height}`);

    // Sanitize brand and pageType for file names
    const sanitizedBrand = sanitizeForFileName(brand);
    const sanitizedPageType = sanitizeForFileName(pageType);
    const baseName = `${sanitizedBrand}-${sanitizedPageType}-${viewport.name}`;

    // Create subdirectory for screenshots
    cy.task('createCompareDir', Cypress.spec.name);

    // Visit first URL and take a screenshot
    cy.visit(baseUrl1);
    cy.wait(5000); // Wait time for mobile view
    cy.get('body').should('be.visible');

    // Pre-scroll the page to trigger lazy loading of images
    cy.scrollTo('bottom', { duration: 1000 });
    cy.wait(2000); // Wait for images to load after scrolling
    cy.scrollTo('top', { duration: 500 });
    cy.wait(2000); // Final wait before taking screenshot

    // Hide any sticky headers to prevent them from appearing multiple times
    cy.window().then((win) => {
      // Find and temporarily hide sticky elements (typically headers)
      const headerTag = win.document.body.querySelector('header');
      if (headerTag) {
        headerTag.style.position = 'relative';
        headerTag.style.height = 0;
      }
    });

    // Take screenshots directly into the compare subdirectory
    cy.screenshot(`original-${baseName}`, { capture: 'fullPage' });

    // Restore sticky elements
    cy.window().then((win) => {
      const headerTag = win.document.body.querySelector('header');
      if (headerTag) {
        // remove the style
        headerTag.removeAttribute('style');
      }
    });

    // Create an args object with all the variables needed in origin
    const originArgs = { baseName, baseUrl2 };

    cy.origin(
      baseUrl2,
      { args: originArgs },
      // Use different parameter names to avoid redeclaration
      ({ baseName: nameFromOrigin, baseUrl2: url2 }) => {
        // Exception handling inside cy.origin()
        Cypress.on('uncaught:exception', () => false);

        // Navigate to URL 2
        cy.visit(url2);

        // Wait to ensure the page is fully loaded
        cy.wait(5000); // Wait time for mobile view
        cy.get('body').should('be.visible');

        // Pre-scroll the page to trigger lazy loading of images
        cy.scrollTo('bottom', { duration: 1000 });
        cy.wait(2000); // Wait for images to load after scrolling
        cy.scrollTo('top', { duration: 500 });
        cy.wait(2000); // Final wait before taking screenshot

        // Hide any sticky headers to prevent them from appearing multiple times
        cy.window().then((win) => {
          // Find and temporarily hide sticky elements (typically headers)
          const headerTag = win.document.body.querySelector('header');
          if (headerTag) {
            headerTag.style.position = 'relative';
            headerTag.style.height = 0;
          }
        });

        // Take a screenshot with the fullPage option
        cy.screenshot(`modified-${nameFromOrigin}`, { capture: 'fullPage' });

        // Restore sticky elements
        cy.window().then((win) => {
          const headerTag = win.document.body.querySelector('header');
          if (headerTag) {
            // remove the style
            headerTag.removeAttribute('style');
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
        threshold: 0.1,
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
