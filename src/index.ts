import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  IThemeManager,
  IToolbarWidgetRegistry
} from '@jupyterlab/apputils';
import {
  EditorExtensionRegistry,
  IEditorExtensionRegistry,
  IEditorLanguageRegistry
} from '@jupyterlab/codemirror';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITerminalTracker } from '@jupyterlab/terminal';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';

// Small, and needed synchronously: editor extension factories cannot be async.
// eslint-disable-next-line jupyter/prefer-lazy-imports
import { extendStaticHighlighting, monokaiSyntax } from './syntax';
import { enableGutterRunButtons } from './cells';
// Also needed at once: the title bar items are registered during activation
// eslint-disable-next-line jupyter/prefer-lazy-imports
import {
  CommandCenter,
  LayoutToggles,
  MenuButton,
  TitleBarLayout
} from './header';
import {
  addNewTerminalButton,
  addTerminalCommands,
  refitShell,
  routeTerminalsToPanel
} from './layout';
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
 * figure-background and Modern UI settings.
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
    INotebookTracker,
    ILabShell,
    IToolbarWidgetRegistry,
    ICommandPalette,
    ITranslator,
    ISettingRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    manager: IThemeManager,
    editorExtensions: IEditorExtensionRegistry | null,
    languages: IEditorLanguageRegistry | null,
    terminals: ITerminalTracker | null,
    notebooks: INotebookTracker | null,
    labShell: ILabShell | null,
    toolbars: IToolbarWidgetRegistry | null,
    palette: ICommandPalette | null,
    translator: ITranslator | null,
    settingRegistry: ISettingRegistry | null
  ) => {
    const trans = (translator ?? nullTranslator).load(
      'jupyterlab_monokai_pro_ce'
    );

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
    if (notebooks) {
      enableGutterRunButtons(notebooks);
    }

    // Modern UI title bar: a command center and side-panel toggles
    if (toolbars) {
      toolbars.addFactory(
        'TopBar',
        'mpce-command-center',
        () => new CommandCenter(app.commands, trans)
      );
      if (labShell) {
        toolbars.addFactory(
          'TopBar',
          'mpce-menu-button',
          () => new MenuButton(app.commands, labShell, trans)
        );
        toolbars.addFactory(
          'TopBar',
          'mpce-layout-toggles',
          () => new LayoutToggles(app.commands, labShell, trans)
        );
      }
    }

    const titleBar = labShell ? new TitleBarLayout(labShell) : null;
    void app.restored.then(() => titleBar?.refresh());

    const setNewTerminalButton = labShell
      ? addNewTerminalButton(app.commands, labShell, trans)
      : () => undefined;

    let terminalsInPanel = true;
    if (labShell && terminals) {
      addTerminalCommands(app.commands, labShell, terminals, trans);
      for (const command of [
        'monokai-pro-ce:toggle-terminal',
        'monokai-pro-ce:new-terminal'
      ]) {
        palette?.addItem({ command, category: trans.__('Terminal') });
      }
      routeTerminalsToPanel(
        labShell,
        terminals,
        () => terminalsInPanel && root.hasAttribute('data-mpce-modern')
      );
    }

    root.dataset.mpceFigureBackground = 'white';
    if (settingRegistry) {
      const apply = (settings: ISettingRegistry.ISettings) => {
        const { figureBackground, modernUI, terminalsInBottomPanel, codicons } =
          settings.composite;
        root.dataset.mpceFigureBackground = figureBackground as string;
        terminalsInPanel = terminalsInBottomPanel !== false;
        const modern = modernUI === true;
        if (modern !== root.hasAttribute('data-mpce-modern')) {
          root.toggleAttribute('data-mpce-modern', modern);
          refitShell(app.shell);
          titleBar?.refresh();
          setNewTerminalButton(modern);
        }
        root.toggleAttribute(
          'data-mpce-codicons',
          modern && codicons !== false
        );
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
