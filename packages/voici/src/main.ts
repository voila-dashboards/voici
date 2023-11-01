/***************************************************************************
 * Copyright (c) 2022, Voilà contributors                                   *
 * Copyright (c) 2022, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/

import '@voila-dashboards/voila/style/index.js';
import '@voila-dashboards/voila/lib/sharedscope';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { IKernelSpecs } from '@jupyterlite/kernel';
import { IServiceWorkerManager, JupyterLiteServer } from '@jupyterlite/server';
import {
  activePlugins,
  createModule,
  loadComponent,
  themesManagerPlugin,
  VoilaShell,
} from '@voila-dashboards/voila';

import { VoiciApp } from './app';
import plugins from './voiciplugins';

const serverExtensions = [import('@jupyterlite/server-extension')];

/**
 * The main function
 */
async function main() {
  const mods = [
    // @jupyterlab plugins
    require('@jupyterlab/codemirror-extension').default.filter(
      (p: any) => p.id === '@jupyterlab/codemirror-extension:languages'
    ),
    require('@jupyterlab/markedparser-extension'),
    require('@jupyterlab/markdownviewer-extension'),
    require('@jupyterlab/mathjax-extension'),
    require('@jupyterlab/rendermime-extension'),
    require('@jupyterlab/theme-light-extension'),
    require('@jupyterlab/theme-dark-extension'),
    require('@jupyter-widgets/jupyterlab-manager/lib/plugin').default.filter(
      (p: any) => p.id !== '@jupyter-widgets/jupyterlab-manager:plugin'
    ),
    themesManagerPlugin,
    plugins,
  ];

  const mimeExtensions = [
    require('@jupyterlite/iframe-extension'),
    require('@jupyterlab/json-extension'),
    require('@jupyterlab/javascript-extension'),
    require('@jupyterlab/vega5-extension'),
  ];

  const extensionData = JSON.parse(
    PageConfig.getOption('federated_extensions')
  );

  const federatedExtensionPromises: any[] = [];
  const federatedMimeExtensionPromises: any[] = [];
  const federatedStylePromises: any[] = [];
  const liteExtensionPromises: any[] = [];

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
    if (data.liteExtension) {
      liteExtensionPromises.push(createModule(data.name, data.extension));
      return;
    }
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

  // Add the serverlite federated extensions.
  const federatedLiteExtensions = await Promise.allSettled(
    liteExtensionPromises
  );
  federatedLiteExtensions.forEach((p) => {
    if (p.status === 'fulfilled') {
      for (const plugin of activePlugins(p.value, [])) {
        litePluginsToRegister.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // create the in-browser JupyterLite Server
  const jupyterLiteServer = new JupyterLiteServer({ shell: null as never });

  jupyterLiteServer.registerPluginModules(litePluginsToRegister);
  // start the server
  await jupyterLiteServer.start();

  const kernelspecs = await jupyterLiteServer.resolveRequiredService(
    IKernelSpecs
  );
  const serviceManager = jupyterLiteServer.serviceManager;

  const app = new VoiciApp({
    serviceManager,
    kernelspecs,
    mimeExtensions,
    shell: new VoilaShell(),
  });

  app.registerPluginModules(mods);

  await app.start();

  const serviceWorkerManager = await jupyterLiteServer.resolveOptionalService(
    IServiceWorkerManager
  );
  if (serviceWorkerManager) {
    try {
      await serviceWorkerManager.ready;
    } catch (err) {
      console.error(err);
    }
  }

  await app.renderWidgets();
  window.jupyterapp = app;
}

window.addEventListener('load', main);
