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
import { PluginRegistry } from '@lumino/coreutils';
import { ServiceManager } from '@jupyterlab/services';

const servicesExtensions = [
  import('@jupyterlab/services-extension'),
  import('@jupyterlite/services-extension'),
];

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

  const pluginsToRegister: any[] = [];

  mods.forEach((mod) => {
    let data = mod.default;
    // Handle commonjs exports.
    if (!Object.prototype.hasOwnProperty.call(mod, '__esModule')) {
      data = mod as any;
    }
    if (!Array.isArray(data)) {
      data = [data];
    }
    data.forEach((plugin: any) => {
      pluginsToRegister.push(plugin);
    });
  });

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
        pluginsToRegister.push(plugin);
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

  const baseServerExtensions = await Promise.all(servicesExtensions);
  baseServerExtensions.forEach((p) => {
    for (const plugin of activePlugins(p, [])) {
      pluginsToRegister.push(plugin);
    }
  });

  // 1. Create a plugin registry
  const pluginRegistry = new PluginRegistry();

  // 2. Register the plugins
  pluginRegistry.registerPlugins(pluginsToRegister);

  // 3. Get and resolve the service manager and connection status plugins
  const IServiceManager = require('@jupyterlab/services').IServiceManager;
  const serviceManager = (await pluginRegistry.resolveRequiredService(
    IServiceManager
  )) as ServiceManager;

  const app = new VoiciApp({
    pluginRegistry,
    serviceManager,
    shell: new VoilaShell(),
  });

  app.started.then(() => {
    const el = document.getElementById('voila-tree-main');
    if (el) {
      el.style.display = 'unset';
    }
  });
  app.start();
}

window.addEventListener('load', main);
