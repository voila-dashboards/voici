// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, test } from '@playwright/test';

test.describe('Voici Tests', () => {
  test.beforeEach(({ page }) => {
    page.setDefaultTimeout(120000);
  });
  test.afterEach(async ({ page, browserName }) => {
    await page.close({ runBeforeUnload: true });
  });

  test('Render Tree', async ({ page, browserName }, testInfo) => {
    const testFunction = async () => {
      await page.goto('');
      // wait for page to load
      await page.waitForSelector('.list-header');
    };

    expect(await page.screenshot()).toMatchSnapshot('voici-tree-classic.png');
  });
});
