module.exports = {
  timeout: 200000,
  reporter: [[process.env.CI ? 'dot' : 'list'], ['html']],
  use: {
    baseURL: 'http://localhost:8866',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  retries: 2,
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  webServer: [
    {
      command: 'jlpm start',
      port: 8866,
      timeout: 120 * 1000,
      reuseExistingServer: true,
    },
  ],
};
