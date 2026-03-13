import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the monokai-pro-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'monokai-pro-jupyterlab:plugin',
  description: 'A JupyterLab theme based on Monokai Pro.',
  autoStart: true,
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log('JupyterLab extension monokai-pro-jupyterlab is activated!');
    const style = 'monokai-pro-jupyterlab/index.css';

    manager.register({
      name: 'monokai-pro-jupyterlab',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default plugin;
