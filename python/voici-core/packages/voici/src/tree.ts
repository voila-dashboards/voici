/***************************************************************************
 * Copyright (c) 2022, Voilà contributors                                   *
 * Copyright (c) 2022, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/
import '@voila-dashboards/voila/style/index.js';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { JupyterLiteServer } from '@jupyterlite/server';
import {
  activePlugins,
  createModule,
  loadComponent,
  pathsPlugin,
  themesManagerPlugin,
  translatorPlugin,
  VoilaShell,
} from '@voila-dashboards/voila';
import { VoiciApp } from './app';
import { themePlugin } from './plugins/themes';
import { treeWidgetPlugin } from './plugins/tree';

const serverExtensions = [import('@jupyterlite/server-extension')];

/**
 * The main function
 */
async function main() {
  const mods = [
    // @jupyterlab plugins
    require('@jupyterlab/theme-light-extension'),
    require('@jupyterlab/theme-dark-extension'),
    pathsPlugin,
    translatorPlugin,
    themesManagerPlugin,
    themePlugin,
    treeWidgetPlugin,
  ];

  const mimeExtensions: any[] = [];

  const extensionData = JSON.parse(
    PageConfig.getOption('federated_extensions')
  );

  const federatedExtensionPromises: any[] = [];
  const federatedMimeExtensionPromises: any[] = [];
  const federatedStylePromises: any[] = [];

  const extensions = await Promise.allSettled(
    extensionData.map(async (data: any) => {
      await loadComponent(
        `${URLExt.join(
          PageConfig.getOption('fullLabextensionsUrl'),
          data.name,
          data.load
        )}`,
        data.name
      );
      return data;
    })
  );

  Object.entries(extensions).forEach(([_, p]) => {
    if (p.status === 'rejected') {
      // There was an error loading the component
      console.error(p.reason);
      return;
    }

    const data = p.value;
    if (data.extension) {
      federatedExtensionPromises.push(createModule(data.name, data.extension));
    }
    if (data.mimeExtension) {
      federatedMimeExtensionPromises.push(
        createModule(data.name, data.mimeExtension)
      );
    }
    if (data.style) {
      federatedStylePromises.push(createModule(data.name, data.style));
    }
  });

  // Add the federated extensions.
  const federatedExtensions = await Promise.allSettled(
    federatedExtensionPromises
  );
  federatedExtensions.forEach((p) => {
    if (p.status === 'fulfilled') {
      for (const plugin of activePlugins(p.value, [])) {
        mods.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // Add the federated mime extensions.
  const federatedMimeExtensions = await Promise.allSettled(
    federatedMimeExtensionPromises
  );
  federatedMimeExtensions.forEach((p) => {
    if (p.status === 'fulfilled') {
      for (const plugin of activePlugins(p.value, [])) {
        mimeExtensions.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // Load all federated component styles and log errors for any that do not
  (await Promise.allSettled(federatedStylePromises))
    .filter(({ status }) => status === 'rejected')
    .forEach((p) => {
      console.error((p as PromiseRejectedResult).reason);
    });

  const litePluginsToRegister: any[] = [];
  const baseServerExtensions = await Promise.all(serverExtensions);
  baseServerExtensions.forEach((p) => {
    for (const plugin of activePlugins(p, [])) {
      litePluginsToRegister.push(plugin);
    }
  });

  // create the in-browser JupyterLite Server
  const jupyterLiteServer = new JupyterLiteServer({ shell: null as never });

  jupyterLiteServer.registerPluginModules(litePluginsToRegister);
  // start the server
  await jupyterLiteServer.start();

  const serviceManager = jupyterLiteServer.serviceManager;
  const app = new VoiciApp({
    serviceManager: serviceManager,
    shell: new VoilaShell(),
  });

  app.registerPluginModules(mods);
  app.started.then(() => {
    const el = document.getElementById('voila-tree-main');
    if (el) {
      el.style.display = 'unset';
    }
  });
  app.start();
}

window.addEventListener('load', main);
