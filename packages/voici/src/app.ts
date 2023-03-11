import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  createRendermimePlugins
} from '@jupyterlab/application';

import { PageConfig } from '@jupyterlab/coreutils';
import { OutputAreaModel, SimplifiedOutputArea } from '@jupyterlab/outputarea';
import { IRenderMime } from '@jupyterlab/rendermime';
import { NotebookModel } from '@jupyterlab/notebook';
import { ServiceManager } from '@jupyterlab/services';
import {
  RenderMimeRegistry,
  standardRendererFactories
} from '@jupyterlab/rendermime';
import { IShell, VoilaShell } from '@voila-dashboards/voila';
import { VoiciWidgetManager } from './manager';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';
import { IKernelSpecs } from '@jupyterlite/kernel';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

const PACKAGE = require('../package.json');

/**
 * App is the main application class. It is instantiated once and shared.
 */
export class VoiciApp extends JupyterFrontEnd<IShell> {
  /**
   * Construct a new App object.
   *
   * @param options The instantiation options for an application.
   */
  constructor(options: App.IOptions) {
    super({
      ...options,
      shell: options.shell ?? new VoilaShell()
    });
    if (options.mimeExtensions) {
      for (const plugin of createRendermimePlugins(options.mimeExtensions)) {
        this.registerPlugin(plugin);
      }
    }

    this._kernelspecs = options.kernelspecs;
    this._serviceManager = options.serviceManager;
  }

  /**
   * The name of the application.
   */
  readonly name = 'Voici';

  /**
   * A namespace/prefix plugins may use to denote their provenance.
   */
  readonly namespace = this.name;

  /**
   * The version of the application.
   */
  readonly version = PACKAGE['version'];

  /**
   * A promise that resolves when the Voici Widget Manager is created
   */
  get widgetManagerPromise(): PromiseDelegate<VoiciWidgetManager> {
    return this._widgetManagerPromise;
  }

  /**
   * The JupyterLab application paths dictionary.
   */
  get paths(): JupyterFrontEnd.IPaths {
    return {
      urls: {
        base: PageConfig.getOption('baseUrl'),
        notFound: PageConfig.getOption('notFoundUrl'),
        app: PageConfig.getOption('appUrl'),
        static: PageConfig.getOption('staticUrl'),
        settings: PageConfig.getOption('settingsUrl'),
        themes: PageConfig.getOption('themesUrl'),
        doc: PageConfig.getOption('docUrl'),
        translations: PageConfig.getOption('translationsApiUrl'),
        hubHost: PageConfig.getOption('hubHost') || undefined,
        hubPrefix: PageConfig.getOption('hubPrefix') || undefined,
        hubUser: PageConfig.getOption('hubUser') || undefined,
        hubServerName: PageConfig.getOption('hubServerName') || undefined
      },
      directories: {
        appSettings: PageConfig.getOption('appSettingsDir'),
        schemas: PageConfig.getOption('schemasDir'),
        static: PageConfig.getOption('staticDir'),
        templates: PageConfig.getOption('templatesDir'),
        themes: PageConfig.getOption('themesDir'),
        userSettings: PageConfig.getOption('userSettingsDir'),
        serverRoot: PageConfig.getOption('serverRoot'),
        workspaces: PageConfig.getOption('workspacesDir')
      }
    };
  }

  /**
   * Register plugins from a plugin module.
   *
   * @param mod - The plugin module to register.
   */
  registerPluginModule(mod: App.IPluginModule): void {
    let data = mod.default;
    // Handle commonjs exports.
    if (!Object.prototype.hasOwnProperty.call(mod, '__esModule')) {
      data = mod as any;
    }
    if (!Array.isArray(data)) {
      data = [data];
    }
    data.forEach(item => {
      try {
        this.registerPlugin(item);
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Register the plugins from multiple plugin modules.
   *
   * @param mods - The plugin modules to register.
   */
  registerPluginModules(mods: App.IPluginModule[]): void {
    mods.forEach(mod => {
      this.registerPluginModule(mod);
    });
  }

  async renderWidgets(): Promise<void> {
    const serviceManager = this._serviceManager;
    if (!serviceManager) {
      console.error('Missing service manager');
      return;
    }
    await serviceManager.ready;
    const sessionManager = serviceManager.sessions;
    await sessionManager.ready;

    const notebookModel = new NotebookModel();
    notebookModel.fromString(PageConfig.getOption('notebookSrc'));

    let requestedKernelspec = notebookModel.metadata.get('kernelspec') as any;
    if (!requestedKernelspec) {
      requestedKernelspec = {
        name: 'python'
      };
    }

    const specs = this._kernelspecs?.specs?.kernelspecs;
    let spec;
    if (!specs) {
      console.error('No kernel available');
      return;
    }

    // First look if the specified kernel is available
    if (requestedKernelspec.name in specs) {
      console.log(`${requestedKernelspec.name} kernel is available!`);
      spec = specs[requestedKernelspec.name];
    }
    // Otherwise fallback to trying to find an available kernel for that language
    else {
      for (const name in specs) {
        if (requestedKernelspec.language === specs[name]?.language) {
          console.log(
            `${
              requestedKernelspec.name
            } kernel is not available, fallback to using ${specs[name]!.name}`
          );
          spec = specs[name];
          break;
        }
      }
    }

    if (!spec) {
      console.error(`No kernel available for ${requestedKernelspec.language}`);
      return;
    }

    const connection = await sessionManager.startNew({
      // TODO Get these name and path information from the exporter
      name: '',
      path: '',
      type: 'notebook',
      kernel: spec
    });
    const kernel = connection.kernel;
    if (!kernel) {
      console.error('Can not start kernel');
      return;
    }

    kernel.connectionStatusChanged.connect(async (_, status) => {
      if (status === 'connected') {
        window.update_loading_text(0, 0, 'Starting up kernel...');
        const rendermime = new RenderMimeRegistry({
          initialFactories: standardRendererFactories
        });

        // Create Voila widget manager
        const widgetManager = new VoiciWidgetManager(kernel, rendermime);
        this._widgetManagerPromise.resolve(widgetManager);
        if (!connection.kernel) {
          return;
        }
        // Execute Notebook

        // The wheels loading step will take way more than 500ms,
        // Let's wait a little bit before listening for the
        // `idle` status of the kernel.
        await new Promise(r => setTimeout(r, 500));
        let executed = false;

        const packagesSrc = PageConfig.getOption('packagesSrc');
        kernel.statusChanged.connect(async (_, status) => {
          if (!executed && status === 'idle') {
            executed = true;
            await App.executeCells({
              packages: packagesSrc,
              source: notebookModel,
              rendermime,
              kernel: connection.kernel!
            });
          }
        });
      }
    });
  }

  private _serviceManager?: ServiceManager;
  private _kernelspecs?: IKernelSpecs;
  private _widgetManagerPromise = new PromiseDelegate<VoiciWidgetManager>();
}

/**
 * A namespace for App statics.
 */
export namespace App {
  /**
   * The instantiation options for an App application.
   */
  export interface IOptions
    extends JupyterFrontEnd.IOptions<IShell>,
      Partial<IInfo> {
    paths?: Partial<JupyterFrontEnd.IPaths>;
    kernelspecs?: IKernelSpecs;
  }

  /**
   * The information about a Voila application.
   */
  export interface IInfo {
    /**
     * The mime renderer extensions.
     */
    readonly mimeExtensions: IRenderMime.IExtensionModule[];
  }

  /**
   * The interface for a module that exports a plugin or plugins as
   * the default value.
   */
  export interface IPluginModule {
    /**
     * The default export.
     */
    default: JupyterFrontEndPlugin<any> | JupyterFrontEndPlugin<any>[];
  }

  export async function executeCells(options: {
    packages?: string;
    source: NotebookModel;
    rendermime: RenderMimeRegistry;
    kernel: IKernelConnection;
  }): Promise<void> {
    const { packages, source, rendermime, kernel } = options;
    if (packages && packages.length > 0) {
      window.update_loading_text(0, 0, 'Installing dependencies');
      const future = kernel.requestExecute({
        code: packages
      });
      await future.done;
    }

    const cellCount = source.cells.length;
    for (let idx = 0; idx < cellCount; idx++) {
      const cell = source.cells.get(idx);
      window.update_loading_text(idx + 1, cellCount, null);
      if (cell.type !== 'code') {
        if (idx === cellCount - 1) {
          window.display_cells();
        }
        continue;
      }
      const model = new OutputAreaModel({ trusted: true });
      const area = new SimplifiedOutputArea({
        model,
        rendermime
      });
      area.future = kernel.requestExecute({
        code: cell.value.text
      });
      await area.future.done;
      const element = document.querySelector(`[cell-index="${idx + 1}"]`);

      if (element) {
        if (area.node.childNodes.length > 0) {
          element.lastElementChild?.classList.remove(
            'jp-mod-noOutputs',
            'jp-mod-noInput'
          );
          const wrapper = document.createElement('div');
          wrapper.classList.add('jp-Cell-outputWrapper');
          element.lastElementChild?.appendChild(wrapper);
          area.node.classList.add('jp-Cell-outputArea', 'jp-OutputArea-child');
          Widget.attach(area, wrapper);
        }
      }
      if (idx === cellCount - 1) {
        window.display_cells();
        window.dispatchEvent(new Event('resize'));
      }
    }
  }
}
