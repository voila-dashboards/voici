module.exports = {
  timeout: 240000,
  reporter: [[process.env.CI ? 'dot' : 'list'], ['html']],
  use: {
    baseURL: 'http://localhost:8866',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'yarn start',
      port: 8866,
      timeout: 120 * 1000,
      reuseExistingServer: true,
    },
  ],
};
