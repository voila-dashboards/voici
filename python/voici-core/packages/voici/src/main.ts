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
import { IServiceWorkerManager } from '@jupyterlite/server';
import {
  activePlugins,
  createModule,
  loadComponent,
  themesManagerPlugin,
  VoilaShell,
} from '@voila-dashboards/voila';

import { VoiciApp } from './app';
import plugins from './voiciplugins';
import { PluginRegistry } from '@lumino/coreutils';
import { ServiceManager } from '@jupyterlab/services';

/**
 * The main function
 */
async function main() {
  const mods = [
    // @jupyterlab plugins
    require('@jupyterlab/services-extension').default.filter((p: any) => {
      const excludedServices = [
        '@jupyterlab/services-extension:config-section-manager',
        '@jupyterlab/services-extension:connection-status',
        '@jupyterlab/services-extension:default-drive',
        '@jupyterlab/services-extension:event-manager',
        '@jupyterlab/services-extension:kernel-manager',
        '@jupyterlab/services-extension:kernel-spec-manager',
        '@jupyterlab/services-extension:nbconvert-manager',
        '@jupyterlab/services-extension:session-manager',
        '@jupyterlab/services-extension:setting-manager',
        '@jupyterlab/services-extension:user-manager',
      ];
      return !excludedServices.includes(p.id);
    }),
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
    require('@jupyterlite/application-extension').default.filter(
      (p: any) =>
        p.id === '@jupyterlite/application-extension:service-worker-manager'
    ),
    require('@jupyterlite/services-extension'),
    themesManagerPlugin,
    plugins,
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

  // 1. Create a plugin registry
  const pluginRegistry = new PluginRegistry();

  // 2. Register the plugins
  pluginRegistry.registerPlugins(pluginsToRegister);

  // 3. Get and resolve the service manager and connection status plugins
  const IServiceManager = require('@jupyterlab/services').IServiceManager;
  const serviceManager = (await pluginRegistry.resolveRequiredService(
    IServiceManager
  )) as ServiceManager;
  const kernelspecs = await pluginRegistry.resolveRequiredService(IKernelSpecs);

  const app = new VoiciApp({
    pluginRegistry,
    serviceManager,
    kernelspecs,
    mimeExtensions,
    shell: new VoilaShell(),
  });

  await app.start();

  const serviceWorkerManager = await pluginRegistry.resolveOptionalService(
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
