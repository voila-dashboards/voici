import {
  KernelWidgetManager,
  WidgetRenderer,
} from '@jupyter-widgets/jupyterlab-manager';
import { PageConfig } from '@jupyterlab/coreutils';
import { IKernelspecMetadata } from '@jupyterlab/nbformat';
import { NotebookModel } from '@jupyterlab/notebook';
import {
  OutputArea,
  OutputAreaModel,
  SimplifiedOutputArea,
} from '@jupyterlab/outputarea';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ServiceManager } from '@jupyterlab/services';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';
import { IKernelSpecs } from '@jupyterlite/kernel';
import { Widget } from '@lumino/widgets';
import { App as VoilaAppNameSpace, VoilaApp } from '@voila-dashboards/voila';

const PACKAGE = require('../package.json');

const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';

/**
 * App is the main application class. It is instantiated once and shared.
 */
export class VoiciApp extends VoilaApp {
  /**
   * Construct a new App object.
   *
   * @param options The instantiation options for an application.
   */
  constructor(options: App.IOptions) {
    super(options);
    this._kernelspecs = options.kernelspecs;
    this._serviceManager = options.serviceManager;
  }

  /**
   * The name of the application.
   */
  readonly name: string = 'Voici';

  /**
   * The version of the application.
   */
  readonly version = PACKAGE['version'];

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
        const rendermime = await this.resolveRequiredService(
          IRenderMimeRegistry
        );
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
        this.widgetManager = widgetManager;
        if (!connection.kernel) {
          return;
        }
        // Execute Notebook

        // The wheels loading step will take way more than 500ms,
        // Let's wait a little bit before listening for the
        // `idle` status of the kernel.
        await new Promise((r) => setTimeout(r, 500));
        let executed = false;

        kernel.statusChanged.connect(async (kernelConnection, status) => {
          if (!executed && status === 'idle') {
            executed = true;
            await App.executeCells({
              source: notebookModel,
              rendermime,
              kernel: kernelConnection,
            });
            const node = document.getElementById('rendered_cells');
            if (node) {
              const cells = new Widget({ node });
              this.shell.add(cells, 'main');
            }
          }
        });
      }
    });
  }

  private _serviceManager?: ServiceManager;
  private _kernelspecs?: IKernelSpecs;
}

/**
 * A namespace for App statics.
 */
export namespace App {
  /**
   * The instantiation options for an App application.
   */
  export interface IOptions extends VoilaAppNameSpace.IOptions {
    kernelspecs?: IKernelSpecs;
    serviceManager?: ServiceManager;
  }

  export async function executeCells(options: {
    source: NotebookModel;
    rendermime: IRenderMimeRegistry;
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
