import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  createRendermimePlugins,
} from '@jupyterlab/application';

import { PageConfig } from '@jupyterlab/coreutils';
import {
  OutputAreaModel,
  OutputArea,
  SimplifiedOutputArea,
} from '@jupyterlab/outputarea';
import { IRenderMime } from '@jupyterlab/rendermime';
import { NotebookModel } from '@jupyterlab/notebook';
import { ServiceManager } from '@jupyterlab/services';
import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';
import { IShell, VoilaShell } from '@voila-dashboards/voila';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';
import { IKernelSpecs } from '@jupyterlite/kernel';
import {
  KernelWidgetManager,
  WidgetRenderer,
} from '@jupyter-widgets/jupyterlab-manager';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import { IKernelspecMetadata } from '@jupyterlab/nbformat';

const PACKAGE = require('../package.json');

const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

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
      shell: options.shell ?? new VoilaShell(),
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
  get widgetManagerPromise(): PromiseDelegate<KernelWidgetManager> {
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
        hubServerName: PageConfig.getOption('hubServerName') || undefined,
      },
      directories: {
        appSettings: PageConfig.getOption('appSettingsDir'),
        schemas: PageConfig.getOption('schemasDir'),
        static: PageConfig.getOption('staticDir'),
        templates: PageConfig.getOption('templatesDir'),
        themes: PageConfig.getOption('themesDir'),
        userSettings: PageConfig.getOption('userSettingsDir'),
        serverRoot: PageConfig.getOption('serverRoot'),
        workspaces: PageConfig.getOption('workspacesDir'),
      },
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
    data.forEach((item) => {
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
    mods.forEach((mod) => {
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

    let requestedKernelspec = notebookModel.metadata['kernelspec'] as
      | IKernelspecMetadata
      | undefined;
    if (!requestedKernelspec) {
      requestedKernelspec = {
        name: 'python',
        display_name: 'python',
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
      kernel: spec,
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
          initialFactories: standardRendererFactories,
        });

        // Create Voila widget manager
        const widgetManager = new KernelWidgetManager(kernel, rendermime);
        rendermime.removeMimeType(WIDGET_MIMETYPE);
        rendermime.addFactory(
          {
            safe: false,
            mimeTypes: [WIDGET_MIMETYPE],
            createRenderer: (options) =>
              new WidgetRenderer(options, widgetManager),
          },
          -10
        );
        this._widgetManagerPromise.resolve(widgetManager);
        if (!connection.kernel) {
          return;
        }
        // Execute Notebook

        // The wheels loading step will take way more than 500ms,
        // Let's wait a little bit before listening for the
        // `idle` status of the kernel.
        await new Promise((r) => setTimeout(r, 500));
        let executed = false;

        kernel.statusChanged.connect(async (_, status) => {
          if (!executed && status === 'idle') {
            executed = true;
            await App.executeCells({
              source: notebookModel,
              rendermime,
              kernel: connection.kernel!,
            });
          }
        });
      }
    });
  }

  private _serviceManager?: ServiceManager;
  private _kernelspecs?: IKernelSpecs;
  private _widgetManagerPromise = new PromiseDelegate<KernelWidgetManager>();
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
    serviceManager?: ServiceManager;
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
    source: NotebookModel;
    rendermime: RenderMimeRegistry;
    kernel: IKernelConnection;
  }): Promise<void> {
    const { source, rendermime, kernel } = options;

    const cellCount = source.cells.length;
    for (let idx = 0; idx < cellCount; idx++) {
      const cell = source.cells.get(idx);
      window.update_loading_text(idx + 1, cellCount, null);
      if (cell.type !== 'code') {
        continue;
      }
      const model = new OutputAreaModel({ trusted: true });

      let area: OutputArea | SimplifiedOutputArea;
      if (PageConfig.getOption('include_output_prompt') === 'true') {
        area = new OutputArea({
          model,
          rendermime,
        });
      } else {
        area = new SimplifiedOutputArea({
          model,
          rendermime,
        });
      }
      console.log('executing', cell.sharedModel.getSource());

      area.future = kernel.requestExecute({
        code: cell.sharedModel.getSource(),
      });
      await area.future.done;
      const element = document.querySelector(`[cell-index="${idx + 1}"]`);
      if (element && PageConfig.getOption('include_output')) {
        if (area.node.childNodes.length > 0) {
          element.lastElementChild?.classList.remove(
            'jp-mod-noOutputs',
            'jp-mod-noInput'
          );
          const wrapper = document.createElement('div');
          wrapper.classList.add('jp-Cell-outputWrapper');
          const collapser = document.createElement('div');
          collapser.classList.add(
            'jp-Collapser',
            'jp-OutputCollapser',
            'jp-Cell-outputCollapser'
          );
          wrapper.appendChild(collapser);
          element.lastElementChild?.appendChild(wrapper);

          area.node.classList.add('jp-Cell-outputArea');

          // Why do we need this? Are we missing a CSS class?
          area.node.style.display = 'flex';
          area.node.style.flexDirection = 'column';

          Widget.attach(area, wrapper);
        }
      }
    }

    window.display_cells();
    window.dispatchEvent(new Event('resize'));
  }
}
