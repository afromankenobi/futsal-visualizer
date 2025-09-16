import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL points to the local preview server serving the built application.
    // This allows us to test the actual build before deploying.
    baseUrl: 'http://localhost:4173',

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