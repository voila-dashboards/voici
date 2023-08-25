/***************************************************************************
 * Copyright (c) 2022, Voilà contributors                                   *
 * Copyright (c) 2022, QuantStack                                           *
 *                                                                          *
 * Distributed under the terms of the BSD 3-Clause License.                 *
 *                                                                          *
 * The full license is in the file LICENSE, distributed with this software. *
 ****************************************************************************/
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';

/**
 * The name for the default JupyterLab light theme
 */
const DEFAULT_JUPYTERLAB_LIGHT_THEME = 'JupyterLab Light';

/**
 * The name for the default JupyterLab dark theme
 */
const DEFAULT_JUPYTERLAB_DARK_THEME = 'JupyterLab Dark';

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
    let cellDisplayed = false;
    themeManager.themeChanged.connect((_, b) => {
      console.log('changed', b);
      if (!cellDisplayed) {
        cellDisplayed = true;
        window.themeLoaded = true;
        if (window.cellLoaded) {
          window.display_cells();
        }
      }
      if (!b.oldValue) {
        themeManager.setTheme(theme);
      }
    });
  },
};
