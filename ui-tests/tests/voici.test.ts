// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, test } from '@playwright/test';

test.describe('Voici Tests', () => {
  test.beforeEach(({ page }) => {
    page.setDefaultTimeout(600000);
  });
  test.afterEach(async ({ page }) => {
    await page.close({ runBeforeUnload: true });
  });

  test('Render Tree', async ({ page }, testInfo) => {
    await page.goto('lite');

    await page.waitForSelector('a:text("widgets")');

    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-tree.png');

    await page.click('a:text("widgets")');

    expect(await page.screenshot()).toMatchSnapshot('voici-subtree.png');

    await page.click('a:text("..")');

    expect(await page.screenshot()).toMatchSnapshot('voici-tree.png');
  });

  test('Render Simple Notebook', async ({ page, context }, testInfo) => {
    await page.goto('lite');
    // Wait for page to load
    await page.waitForSelector('a:text("voici.ipynb")');

    // Open the notebook in a new tab
    [page] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a:text("voici.ipynb")'),
    ]);

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-simple.png');
  });

  test('Render bqplot Notebook', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    await page.waitForSelector('a:text("widgets")');
    await page.click('a:text("widgets")');
    await page.waitForSelector('a:text("bqplot.ipynb")');

    // Open the notebook in a new tab
    [page] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a:text("bqplot.ipynb")'),
    ]);

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-bqplot.png');
  });

  test('Render ipycanvas Notebook', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    await page.waitForSelector('a:text("widgets")');
    await page.click('a:text("widgets")');
    await page.waitForSelector('a:text("ipycanvas.ipynb")');

    // Open the notebook in a new tab
    [page] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a:text("ipycanvas.ipynb")'),
    ]);

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-ipycanvas.png');
  });

  test('Render dark theme', async ({ page }, testInfo) => {
    await page.goto('lite/voici/render/widgets/bqplot.html?theme=dark');

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-dark.png');
  });

  test('Render material template', async ({ page, context }, testInfo) => {
    await page.goto('material');

    await page.waitForSelector('a:text("widgets")');

    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-tree-material.png');

    await page.click('a:text("widgets")');

    expect(await page.screenshot()).toMatchSnapshot(
      'voici-subtree-material.png'
    );

    await page.click('a:text("..")');

    await page.waitForSelector('a:text("voici.ipynb")');

    expect(await page.screenshot()).toMatchSnapshot('voici-tree-material.png');

    // Open the notebook (The material template does not open in a new tab?)
    await page.click('a:text("voici.ipynb")');

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot(
      'voici-simple-material.png'
    );
  });
});
