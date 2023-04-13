/***************************************************************************
 * Copyright (c) 2022, Voilà contributors                                   *
 * Copyright (c) 2022, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/
import * as base from '@jupyter-widgets/base';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import { translatorPlugin, pathsPlugin } from '@voila-dashboards/voila';
import { PageConfig } from '@jupyterlab/coreutils';
import { VoiciApp } from './app';

/**
 * The name for the default JupyterLab light theme
 */
const DEFAULT_JUPYTERLAB_LIGHT_THEME = 'JupyterLab Light';

/**
 * The name for the default JupyterLab dark theme
 */
const DEFAULT_JUPYTERLAB_DARK_THEME = 'JupyterLab Dark';

/**
 * The Voici widgets manager plugin.
 */
const widgetManager = {
  id: '@voila-dashboards/voici:widget-manager',
  autoStart: true,
  provides: base.IJupyterWidgetRegistry,
  activate: async (app: JupyterFrontEnd): Promise<any> => {
    if (!(app instanceof VoiciApp)) {
      throw Error(
        'The Voici Widget Manager plugin must be activated in a VoilaApp'
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

/**
 * A plugin to handler the theme
 */
export const themePlugin: JupyterFrontEndPlugin<void> = {
  id: '@voila-dashboards/voici:theme-manager',
  autoStart: true,
  optional: [IThemeManager],
  activate: (app: JupyterFrontEnd, themeManager: IThemeManager | null) => {
    if (!themeManager) {
      return;
    }

    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const urltheme = urlParams.get('theme');

    // retrieve the name of the theme as it may already be set as a data attribute on the page
    const labThemeName = PageConfig.getOption('jpThemeName');

    // query string parameter takes precedence over the page config value
    let theme = urltheme ? decodeURIComponent(urltheme) : labThemeName;

    // default to the light theme if the theme is not specified (empty)
    theme = theme || 'light';

    if (theme === 'dark' || theme === DEFAULT_JUPYTERLAB_DARK_THEME) {
      theme = 'JupyterLab Dark';
    }
    if (theme === 'light' || theme === DEFAULT_JUPYTERLAB_LIGHT_THEME) {
      theme = 'JupyterLab Light';
    }

    // TODO Find a way to wait for settings loaded
    // Listening to theme changed is a workaround for waiting for settings to be loaded
    themeManager.themeChanged.connect(() => {
      if (themeManager.theme !== theme) {
        themeManager.setTheme(theme);
      }
    });
  },
};

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
