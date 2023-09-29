// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, test } from '@playwright/test';

test.describe('Voici Tests', () => {
  test.beforeEach(({ page }) => {
    page.setDefaultTimeout(600000);

    page.on('console', (message) => {
      console.log('CONSOLE MSG ---', message.text());
    });
  });

  test.afterEach(async ({ page }) => {
    await page.close({ runBeforeUnload: true });
  });

  test('Render Tree', async ({ page }, testInfo) => {
    await page.goto('lite');

    const widget = await page.getByText('widgets');

    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-tree.png');

    await widget.click();

    expect(await page.screenshot()).toMatchSnapshot('voici-subtree.png');

    const goUp = await page.getByTitle('Jupyter Server Root').locator('svg');
    await goUp.click();

    expect(await page.screenshot()).toMatchSnapshot('voici-tree.png');
  });

  test('Render Simple Notebook', async ({ page, context }, testInfo) => {
    await page.goto('lite');
    // Wait for page to load
    const voici = await page.getByText('voici.ipynb');

    // Open the notebook in a new tab
    [page] = await Promise.all([context.waitForEvent('page'), voici.click()]);

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-simple.png');
  });

  test('Render bqplot Notebook', async ({ page, context }, testInfo) => {
    await page.goto('lite');
    const widget = await page.getByText('widgets');
    await widget.click();
    const bqplot = await page.getByText('bqplot.ipynb');

    // Open the notebook in a new tab
    [page] = await Promise.all([context.waitForEvent('page'), bqplot.click()]);

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-bqplot.png');
  });

  test('Render ipycanvas Notebook', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    const widget = await page.getByText('widgets');
    await widget.click();
    const ipycanvas = await page.getByText('ipycanvas.ipynb');

    // Open the notebook in a new tab
    [page] = await Promise.all([
      context.waitForEvent('page'),
      ipycanvas.click(),
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

    const widget = await page.getByText('widgets');

    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('voici-tree-material.png');
    await page.waitForTimeout(1000);

    await widget.click();
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot(
      'voici-subtree-material.png'
    );

    await page.click('a:text("..")');

    const voici = page.getByText('voici.ipynb');

    expect(await page.screenshot()).toMatchSnapshot('voici-tree-material.png');

    // Open the notebook (The material template does not open in a new tab?)
    await voici.click();

    // Wait for page to load
    await page.waitForSelector('.jupyter-widgets');
    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot(
      'voici-simple-material.png'
    );
  });
});
