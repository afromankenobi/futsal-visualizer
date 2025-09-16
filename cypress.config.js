import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL points to the deployed GitHub Pages site. When running locally,
    // Cypress will prepend this base URL to cy.visit() paths. Adjust as needed.
    baseUrl: 'https://afromankenobi.github.io/futsal-visualizer/',

    // Disable support file as this project doesn't use one
    supportFile: false,

    // Custom spec pattern to match test file in project root
    specPattern: '*.cy.js',

    // Disable video recordings to reduce artifact size. Enable if you need videos
    // of failing test runs.
    video: false,

    // Do not capture screenshots on failure to keep CI runs lightweight.
    screenshotOnRunFailure: false,

    // Increase default command timeout for networked resources
    defaultCommandTimeout: 10000,
  },
});