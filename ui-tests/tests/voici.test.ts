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
    // Wait for page to load
    await page.waitForSelector('a');
    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-tree.png');
  });

  test('Render Simple Notebook', async ({ page, browserName }, testInfo) => {
    await page.goto('voila/render/test.html');
    // Wait for page to load
    await page.waitForSelector('pre');
    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-simple.png');
  });
});
