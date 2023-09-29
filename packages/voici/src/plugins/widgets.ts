/***************************************************************************
 * Copyright (c) 2022, Voilà contributors                                   *
 * Copyright (c) 2022, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/
import * as base from '@jupyter-widgets/base';
import { JupyterFrontEnd } from '@jupyterlab/application';

import { VoiciApp } from '../app';

/**
 * The Voici widgets manager plugin.
 */
export const widgetManager = {
  id: '@voila-dashboards/voici:widget-manager',
  autoStart: true,
  provides: base.IJupyterWidgetRegistry,
  activate: async (app: JupyterFrontEnd): Promise<any> => {
    if (!(app instanceof VoiciApp)) {
      throw Error(
        'The Voici Widget Manager plugin must be activated in a VoiciApp'
      );
    }
    const managerPromise = app.widgetManagerPromise;
    return {
      registerWidget: async (data: any) => {
        const manager = await managerPromise.promise;
        manager.register(data);
      },
    };
  },
};
