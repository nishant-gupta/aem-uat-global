/* eslint-disable no-undef */
const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

before(() => {
  cy.task('clearScreenshots');
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
      cy.log(`🔍 Comparing screenshots between ${baseUrl1} and ${baseUrl2} for ${brand}, page type : ${pageType} for viewport ${width}/${height}`);

      const baseName = `${brand}-${pageType}-${name}`;

      // Visit first URL and take a screenshot
      cy.visit(baseUrl1);
      cy.wait(6000);
      cy.get('body').should('be.visible');
      cy.get('footer').should('be.visible');
      cy.takeFullPageScreenshot(`compare/original-${baseName}`);

      cy.origin(baseUrl2, { args: { baseName, baseUrl2 } }, ({ baseName, baseUrl2 }) => {
        // Exception handling inside cy.origin()
        Cypress.on('uncaught:exception', () => false);

        // Register the custom command with proper options in the new origin
        Cypress.Commands.add('takeFullPageScreenshot', { prevSubject: false }, window.takeFullPageScreenshotFn);

        // Navigate to URL 2
        cy.visit(baseUrl2);

        // Wait to ensure the page is fully loaded
        cy.wait(6000);

        // Ensure page visibility before taking a screenshot
        cy.get('body').should('be.visible');
        cy.get('footer').should('be.visible');

        // Scroll to the bottom before taking the screenshot
        cy.window().then((win) => {
          win.scrollTo(0, document.body.scrollHeight + 300);
        });

        // Wait for scrolling to complete
        cy.wait(2000);

        // Now we can use the custom command
        cy.document().then((doc) => {
          const { body } = doc;
          const html = doc.documentElement;
          const contentHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
          );

          // Scroll in smaller increments for smoother capture
          const scrollStep = Math.floor(contentHeight / 10);
          let currentScroll = 0;

          // Scroll and wait pattern
          const scrollAndWait = () => {
            if (currentScroll < contentHeight) {
              cy.scrollTo(0, currentScroll);
              cy.wait(200); // Wait for any lazy loading
              currentScroll += scrollStep;
              scrollAndWait();
            } else {
              // Scroll back to top before screenshot
              cy.scrollTo('top');
              cy.wait(500); // Final wait for stability
              cy.screenshot(`compare/modified-${baseName}`, { capture: 'fullPage' });
            }
          };

          scrollAndWait();
        });
      });

      cy.task('getScreenshotPath', Cypress.spec.name).then((screenshotPath) => {
        cy.log(`Dynamic Screenshot Path: ${screenshotPath}`);

        cy.task('compareScreenshots', { name: baseName, screenshotPath, threshold: 0.1 }).then((result) => {
          if (!result.success) {
            cy.log(`Mismatch detected: ${result.mismatch}% difference`);
            cy.log(`Diff saved at: ${result.diffImage}`);
            expect(result.success).to.be.true;
          } else {
            cy.log('Screenshots match within threshold.');
            expect(result.success).to.be.true;
          }
        });
      });
    });
  });
});
