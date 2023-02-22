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
    await page.goto('');
    // wait for page to load
    await page.waitForSelector('a');

    expect(await page.screenshot()).toMatchSnapshot('voici-tree.png');
  });

  test('Render Simple Notebook', async ({ page, browserName }, testInfo) => {
    await page.goto('voila/render/test.html');
    // wait for page to load
    await page.waitForSelector('pre');

    expect(await page.screenshot()).toMatchSnapshot('voici-simple.png');
  });
});
