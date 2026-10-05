import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import {
  EditorExtensionRegistry,
  IEditorExtensionRegistry,
  IEditorLanguageRegistry
} from '@jupyterlab/codemirror';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITerminalTracker } from '@jupyterlab/terminal';

// Small, and needed synchronously: editor extension factories cannot be async.
// eslint-disable-next-line jupyter/prefer-lazy-imports
import { extendStaticHighlighting, monokaiSyntax } from './syntax';
import { themeTerminals } from './terminal';

const PLUGIN_ID = 'jupyterlab-monokai-pro-ce:plugin';

/** Bundled stylesheet; holds both variants, keyed on `data-mpce-theme`. */
const STYLE = 'jupyterlab-monokai-pro-ce/index.css';

const VARIANTS = [
  { name: 'Monokai Pro (CE)', variant: 'dark', isLight: false },
  { name: 'Monokai Pro Light (CE)', variant: 'light', isLight: true }
];

const root = document.documentElement;

/**
 * Registers the Monokai Pro (CE) dark and light themes, the editor
 * extension and Markdown code-block highlighting that enable
 * Monokai-accurate token colors, terminal ANSI colors, and the
 * figure-background setting.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'Monokai Pro (CE) dark and light themes for JupyterLab',
  autoStart: true,
  requires: [IThemeManager],
  optional: [
    IEditorExtensionRegistry,
    IEditorLanguageRegistry,
    ITerminalTracker,
    ISettingRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    manager: IThemeManager,
    editorExtensions: IEditorExtensionRegistry | null,
    languages: IEditorLanguageRegistry | null,
    terminals: ITerminalTracker | null,
    settingRegistry: ISettingRegistry | null
  ) => {
    for (const { name, variant, isLight } of VARIANTS) {
      manager.register({
        name,
        isLight,
        themeScrollbars: true,
        load: () => {
          // Set before the stylesheet arrives so the palette applies on the
          // first paint. The theme manager unloads the previous theme first,
          // so switching between the two variants is safe.
          root.dataset.mpceTheme = variant;
          return manager.loadCSS(STYLE);
        },
        unload: () => {
          delete root.dataset.mpceTheme;
          return Promise.resolve(undefined);
        }
      });
    }

    editorExtensions?.addExtension({
      name: 'jupyterlab-monokai-pro-ce:syntax',
      factory: () =>
        EditorExtensionRegistry.createImmutableExtension(monokaiSyntax())
    });
    if (languages) {
      extendStaticHighlighting(languages);
    }
    if (terminals) {
      themeTerminals(terminals);
    }

    root.dataset.mpceFigureBackground = 'white';
    if (settingRegistry) {
      const apply = (settings: ISettingRegistry.ISettings) => {
        root.dataset.mpceFigureBackground = settings.composite
          .figureBackground as string;
      };
      settingRegistry
        .load(PLUGIN_ID)
        .then(settings => {
          apply(settings);
          settings.changed.connect(apply);
        })
        .catch(reason => {
          console.error(`Failed to load settings for ${PLUGIN_ID}.`, reason);
        });
    }
  }
};

export default plugin;
