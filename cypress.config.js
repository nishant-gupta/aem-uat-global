const fs = require('fs-extra');
const resemble = require('resemblejs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  e2e: {
    env: {
      BASE_URL: process.env.BASE_URL,
      URL_1: process.env.URL_1,
      URL_2: process.env.URL_2,
      Brandcode: process.env.Brandcode,
      PageType: process.env.PageType,
    },
    defaultCommandTimeout: 10000,
    screenshotOnRunFailure: true,
    screenshotConfig: {
      capture: 'viewport',
      disableTimersAndAnimations: true, // Prevent UI animations affecting screenshots
      overwrite: true,
    },
    setupNodeEvents(on, config) {
      // Register tasks
      on('task', {
        clearScreenshots() {
          const screenshotsPath = path.join(__dirname, 'cypress', 'screenshots');
          console.log(`Deleting old screenshots from: ${screenshotsPath}`);

          // Check if the folder exists and delete contents
          if (fs.existsSync(screenshotsPath)) {
            fs.emptyDirSync(screenshotsPath);
          }
          return null;
        },
        getScreenshotPath(specName) {
          const screenshotFolder = config.screenshotsFolder || 'cypress/screenshots';
          const isHeadless = config.isTextTerminal;
          return isHeadless ? path.join(screenshotFolder, specName) : screenshotFolder;
        },
        async compareScreenshots({ name, screenshotPath, threshold = 0.1 }) {
          const screenshotsDir = path.join(screenshotPath, 'compare');
          const baseline = path.join(screenshotsDir, `original-${name}.png`);
          const modified = path.join(screenshotsDir, `modified-${name}.png`);
          const diffOutput = path.join(screenshotsDir, `diff-${name}.png`);

          console.log('Comparing screenshots:', baseline, modified);

          if (!fs.existsSync(baseline) || !fs.existsSync(modified)) {
            console.error('One or both screenshot files do not exist:', baseline, modified);
            return { success: false, error: 'Baseline or modified image missing' };
          }

          return new Promise((resolve) => {
            // eslint-disable-next-line no-undef
            resemble(baseline)
              .compareTo(modified)
              .ignoreColors() // Ignores colors (optional)
              .onComplete((data) => {
                const misMatchPercentage = parseFloat(data.misMatchPercentage);
                console.log(`Mismatch: ${misMatchPercentage}%`);

                if (misMatchPercentage > threshold * 100) {
                  // Save diff image
                  fs.writeFileSync(diffOutput, data.getBuffer());
                  console.log(`Diff image saved at: ${diffOutput}`);

                  resolve({ success: false, diffImage: diffOutput, mismatch: misMatchPercentage });
                } else {
                  fs.writeFileSync(diffOutput, data.getBuffer());

                  resolve({ success: true, mismatch: misMatchPercentage });
                }
              });
          });
        },
      });

      return config;
    },
  },
};
