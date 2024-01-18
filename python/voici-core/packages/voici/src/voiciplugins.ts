/***************************************************************************
 * Copyright (c) 2022, Voilà contributors                                   *
 * Copyright (c) 2022, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { pathsPlugin, translatorPlugin } from '@voila-dashboards/voila';
import { widgetManager } from './plugins/widgets';
import { themePlugin } from './plugins/themes';

/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  pathsPlugin,
  translatorPlugin,
  widgetManager,
  themePlugin,
];

export default plugins;
