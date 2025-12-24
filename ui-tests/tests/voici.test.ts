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

  test('Local module imports', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    const localModule = page.getByText('local_module');
    await localModule.click();

    // Open the local_imports notebook
    const notebook = page.getByText('local_imports.ipynb');
    [page] = await Promise.all([context.waitForEvent('page'), notebook.click()]);

    // Verify clean_column_names computed correctly
    await page.waitForSelector("text=['first_name', 'last_name', 'email_address']", { timeout: 60000 });

    // Verify filter_outliers removed the outlier (100)
    await expect(page.locator('text=[10, 12, 11, 13, 12, 11, 14, 12]')).toBeVisible();
  });

  test('Navigate via relative notebook link', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    // Open the main voici.ipynb notebook which contains markdown links to other notebooks
    const voici = page.getByText('voici.ipynb');
    [page] = await Promise.all([context.waitForEvent('page'), voici.click()]);

    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    const bqplotLink = page.locator('a', { hasText: 'bqplot' }).first();
    await bqplotLink.click();

    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    // Verify the URL changed to the bqplot.html page
    expect(page.url()).toContain('bqplot.html');
  });

  test('Navigate via relative file link', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    const voici = page.getByText('voici.ipynb');
    [page] = await Promise.all([context.waitForEvent('page'), voici.click()]);

    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    const readmeLink = page.locator('a', { hasText: 'README' }).first();
    await readmeLink.click();

    await page.waitForURL(/README\.md/);

    // Verify the URL changed to the README.md page
    expect(page.url()).toContain('README.md');
  });

  test('Download file via relative link', async ({ page, context }, testInfo) => {
    await page.goto('lite');

    const voici = page.getByText('voici.ipynb');
    [page] = await Promise.all([context.waitForEvent('page'), voici.click()]);

    await page.waitForSelector('.jupyter-widgets');
    await page.waitForTimeout(1000);

    const downloadPromise = page.waitForEvent('download');
    const csvLink = page.locator('a', { hasText: 'Download the data' }).first();
    await csvLink.click();

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('indicators.csv');
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