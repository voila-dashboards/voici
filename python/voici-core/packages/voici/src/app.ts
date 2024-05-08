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
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';
import { Widget } from '@lumino/widgets';
import {
  App as VoilaAppNameSpace,
  RenderedCells,
  VoilaApp,
} from '@voila-dashboards/voila';

import { VoiciKernelManager } from './kernelmanager';

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
    this._kernelManager = options.kernelManager;
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
    const isReady = await this._kernelManager?.ready();
    if (!isReady) {
      return;
    }
    const rendermime = await this.resolveRequiredService(IRenderMimeRegistry);
    App.typesetMarkdown(rendermime);

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

    const kernel = await this._kernelManager!.connectKernel(
      requestedKernelspec
    );
    if (!kernel) {
      console.error('Can not start kernel');
      return;
    }
    kernel.connectionStatusChanged.connect(async (_, status) => {
      if (status === 'connected') {
        window.update_loading_text(0, 0, 'Starting up kernel...');
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
        if (!kernel) {
          return;
        }
        // Execute Notebook

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
              const cells = new RenderedCells({ node });
              this.shell.add(cells, 'main');
            }
          }
        });
      }
    });
  }

  private _kernelManager: VoiciKernelManager | undefined;
}

/**
 * A namespace for App statics.
 */
export namespace App {
  /**
   * The instantiation options for an App application.
   */
  export interface IOptions extends VoilaAppNameSpace.IOptions {
    kernelManager?: VoiciKernelManager;
  }

  export function typesetMarkdown(rendermime: IRenderMimeRegistry): void {
    // Render latex in markdown cells
    const mdOutput = document.body.querySelectorAll('div.jp-MarkdownOutput');
    mdOutput.forEach((md) => {
      rendermime.latexTypesetter?.typeset(md as HTMLElement);
    });
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
