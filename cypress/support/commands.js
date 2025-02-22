/* eslint-disable no-undef */
// Define the command function separately so it can be reused
function takeFullPageScreenshotFn(name) {
  // Get total page height
  cy.document().then((doc) => {
    const { body } = doc;
    const html = doc.documentElement;
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    );

    // Scroll in smaller increments for smoother capture
    const scrollStep = Math.floor(height / 10);
    let currentScroll = 0;

    // Scroll and wait pattern
    const scrollAndWait = () => {
      if (currentScroll < height) {
        cy.scrollTo(0, currentScroll);
        cy.wait(200); // Wait for any lazy loading
        currentScroll += scrollStep;
        scrollAndWait();
      } else {
        // Scroll back to top before screenshot
        cy.scrollTo('top');
        cy.wait(500); // Final wait for stability
        cy.screenshot(name, { capture: 'fullPage' });
      }
    };

    scrollAndWait();
  });
}

// Register the command with proper options
// eslint-disable-next-line no-undef
Cypress.Commands.add('takeFullPageScreenshot', { prevSubject: false }, takeFullPageScreenshotFn);

// Make the function available globally for cy.origin
window.takeFullPageScreenshotFn = takeFullPageScreenshotFn;
