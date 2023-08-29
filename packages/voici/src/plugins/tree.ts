/***************************************************************************
 * Copyright (c) 2023, Voilà contributors                                   *
 * Copyright (c) 2023, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { PageConfig, URLExt, PathExt } from '@jupyterlab/coreutils';
import { DocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { FilterFileBrowserModel } from '@jupyterlab/filebrowser';
import { Widget } from '@lumino/widgets';

import { VoilaFileBrowser } from '@voila-dashboards/voila';

/**
 * The voici file browser provider.
 */
export const treeWidgetPlugin: JupyterFrontEndPlugin<void> = {
  id: '@voila-dashboards/voici:tree-widget',
  description: 'Provides the file browser.',
  activate: (app: JupyterFrontEnd): void => {
    const docRegistry = new DocumentRegistry();
    const docManager = new DocumentManager({
      registry: docRegistry,
      manager: app.serviceManager,
      opener,
    });
    const fbModel = new FilterFileBrowserModel({
      manager: docManager,
      refreshInterval: 2147483646,
      filter: (value) => {
        if (value.type === 'notebook' || value.type === 'directory') {
          return {};
        }
        return null;
      },
    });
    const urlFactory = (path: string) => {
      const dir = PathExt.dirname(path);
      const baseName = PathExt.basename(path);
      const ext = PathExt.extname(path);
      const newPath = `${dir}/${baseName.replace(ext, '.html')}`;
      const baseUrl = PageConfig.getBaseUrl();
      const query = PageConfig.getOption('query');
      return URLExt.join(baseUrl, 'voici', 'render', newPath) + `?${query}`;
    };
    const fb = new VoilaFileBrowser({
      id: 'filebrowser',
      model: fbModel,
      urlFactory,
      title: 'Select items to open with Voici.',
    });

    fb.showFileCheckboxes = false;
    fb.showLastModifiedColumn = false;

    const spacerTop = new Widget();
    spacerTop.addClass('spacer-top-widget');
    app.shell.add(spacerTop, 'main');

    app.shell.add(fb, 'main');

    const spacerBottom = new Widget();
    spacerBottom.addClass('spacer-bottom-widget');
    app.shell.add(spacerBottom, 'main');
  },

  autoStart: true,
};
