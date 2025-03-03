import { defineConfig } from 'cypress'

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  video: false,
  env: {
    useRealBackend: process.env['CYPRESS_USE_REAL_BACKEND'] === 'false',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts').default(on, config)
    },
    baseUrl: 'http://localhost:4200',
    // baseUrl: process.env['CYPRESS_USE_REAL_BACKEND'] === 'true'
    //   ? 'https://real-backend-url.com' // Backend réel
    //   : 'http://localhost:4200', // Backend mocké/local
  },
})
