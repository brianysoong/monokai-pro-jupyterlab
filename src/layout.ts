/**
 * Lumino layouts cache each container's padding and border the first time
 * they fit. The Modern UI changes that padding (to open gutters between
 * cards) after the shell has already been laid out, so every container has
 * to be asked to fit again.
 */

import { ILabShell } from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ITerminal, ITerminalTracker } from '@jupyterlab/terminal';
import { TranslationBundle } from '@jupyterlab/translation';
import { CommandRegistry } from '@lumino/commands';
import { MessageLoop } from '@lumino/messaging';
import { SplitPanel, TabPanel, Widget } from '@lumino/widgets';

function fitTree(widget: Widget): void {
  for (const child of widget.children()) {
    fitTree(child);
  }
  MessageLoop.sendMessage(widget, Widget.Msg.FitRequest);
}

export function refitShell(shell: Widget): void {
  fitTree(shell);
  shell.update();
}

/**
 * Show a terminal and give it keyboard focus. `activateById` only selects
 * widgets in the bottom panel, so activate the terminal itself as well.
 */
function focusTerminal(
  shell: ILabShell,
  widget: MainAreaWidget<ITerminal.ITerminal> | null
): void {
  if (!widget) {
    return;
  }
  shell.activateById(widget.id);
  // A new terminal can only take focus once xterm has started
  const content = widget.content as ITerminal.ITerminal & {
    ready?: Promise<void>;
  };
  void (content.ready ?? Promise.resolve()).then(() =>
    requestAnimationFrame(() => content.activate())
  );
}

/**
 * Collapse and expand the bottom panel. JupyterLab 4.6 added public
 * methods for this, which keep the panel's size; older releases only have
 * the shell's private panels, so the size is kept here.
 */
function downArea(shell: ILabShell) {
  const api = shell as unknown as {
    downCollapsed?: boolean;
    collapseDown?: () => void;
    expandDown?: () => void;
  };
  const { _downPanel: panel, _vsplitPanel: split } = shell as unknown as {
    _downPanel?: Widget;
    _vsplitPanel?: SplitPanel;
  };
  let sizes: number[] | null = null;
  return {
    collapsed: () => api.downCollapsed ?? panel?.isHidden ?? false,
    collapse: () => {
      if (api.collapseDown) {
        api.collapseDown();
      } else if (panel && !panel.isHidden) {
        sizes = split?.relativeSizes() ?? null;
        panel.hide();
      }
    },
    expand: () => {
      if (api.expandDown) {
        api.expandDown();
      } else if (panel?.isHidden) {
        panel.show();
        if (sizes) {
          split?.setRelativeSizes(sizes);
        }
      }
    }
  };
}

const inPanel = (w: Widget | null) => !!w?.node.closest('#jp-down-stack');

/**
 * Move terminals that are outside the bottom panel into it, such as those a
 * workspace saved before they were routed there restores to the main area.
 * The bottom panel is a plain tab panel, so tabs cannot be dragged into it.
 */
export function dockTerminals(
  shell: ILabShell,
  terminals: ITerminalTracker
): void {
  terminals.forEach(widget => {
    if (!widget.isDisposed && !inPanel(widget)) {
      shell.add(widget, 'down');
    }
  });
}

/**
 * Move new terminals into the bottom panel, where VS Code keeps its
 * terminal. JupyterLab adds a terminal to the main area before tracking it,
 * so moving it when the tracker sees it is final.
 */
export function routeTerminalsToPanel(
  shell: ILabShell,
  terminals: ITerminalTracker,
  enabled: () => boolean
): void {
  terminals.widgetAdded.connect((_, widget) => {
    if (enabled() && !widget.isDisposed) {
      shell.add(widget, 'down');
      focusTerminal(shell, widget);
    }
  });
}

/** The server's terminal sessions (`app.serviceManager.terminals`). */
interface ITerminalSessions {
  running(): IterableIterator<{ name: string }>;
  refreshRunning(): Promise<void>;
}

/**
 * VS Code's terminal shortcuts:
 *
 * - toggle (Ctrl+`): if no terminal is open, reopen one still running on
 *   the server, or open a new one; otherwise show and focus it, or, if it
 *   already has focus, hide the bottom panel and return to the document.
 * - new (Ctrl+Shift+`): open another terminal.
 * - hide panel: hide the bottom panel, as its close button does.
 *
 * Terminals land in the bottom panel when the Modern UI routes them there
 * (`routed`), and toggling first moves any stray terminal into it;
 * otherwise these act on terminals wherever they are.
 */
export function addTerminalCommands(
  commands: CommandRegistry,
  shell: ILabShell,
  terminals: ITerminalTracker,
  trans: TranslationBundle,
  routed: () => boolean,
  sessions: ITerminalSessions
): void {
  // The document to return to when the terminal is hidden
  let lastDocument: Widget | null = null;
  shell.currentChanged.connect((_, { newValue }) => {
    if (newValue && !terminals.has(newValue)) {
      lastDocument = newValue;
    }
  });

  // Prefer the terminal showing in the bottom panel, then any in the panel,
  // then any terminal at all
  const panelTerminal = () => {
    const all = [terminals.currentWidget, ...terminals.filter(() => true)];
    return (
      all.find(w => inPanel(w) && w!.isVisible) ??
      all.find(w => inPanel(w)) ??
      all.find(w => w) ??
      null
    );
  };
  const returnToDocument = () => {
    const target =
      lastDocument && !lastDocument.isDisposed && lastDocument.isAttached
        ? lastDocument
        : Array.from(shell.widgets('main')).find(w => w.isVisible);
    if (target) {
      shell.activateById(target.id);
    }
  };
  const down = downArea(shell);

  // Closing a terminal's tab keeps its session running on the server unless
  // JupyterLab's "Shut down on close" is set. Remember the latest one, so
  // toggling reopens it rather than starting yet another terminal.
  let lastClosed: string | null = null;
  terminals.widgetAdded.connect((_, widget) => {
    widget.disposed.connect(() => {
      lastClosed = widget.content.session?.name ?? lastClosed;
    });
  });
  const runningSession = async (): Promise<string | null> => {
    try {
      await sessions.refreshRunning();
    } catch {
      // Use the last known list
    }
    const names = Array.from(sessions.running(), model => model.name);
    if (lastClosed && names.includes(lastClosed)) {
      return lastClosed;
    }
    // Otherwise the newest; JupyterLab names terminals 1, 2, 3, ...
    return (
      names.sort((a, b) => Number(b) - Number(a) || b.localeCompare(a))[0] ??
      null
    );
  };

  commands.addCommand('monokai-pro-ce:toggle-terminal', {
    label: trans.__('Toggle Terminal'),
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      if (routed()) {
        dockTerminals(shell, terminals);
      }
      const terminal = panelTerminal();
      if (!terminal) {
        const name = await runningSession();
        await commands.execute(
          name ? 'terminal:open' : 'terminal:create-new',
          name ? { name } : {}
        );
        return;
      }
      const docked = inPanel(terminal);
      const focused = docked
        ? !!document.activeElement?.closest('#jp-down-stack')
        : terminal.node.contains(document.activeElement);
      if (docked && down.collapsed()) {
        down.expand();
        focusTerminal(shell, terminal);
      } else if (focused) {
        if (docked) {
          down.collapse();
        }
        returnToDocument();
      } else {
        focusTerminal(shell, terminal);
      }
    }
  });

  commands.addCommand('monokai-pro-ce:hide-panel', {
    label: trans.__('Hide Panel'),
    describedBy: { args: { type: 'object', properties: {} } },
    isEnabled: () => !down.collapsed(),
    execute: () => {
      const focused = !!document.activeElement?.closest('#jp-down-stack');
      down.collapse();
      if (focused) {
        returnToDocument();
      }
    }
  });

  commands.addCommand('monokai-pro-ce:new-terminal', {
    label: trans.__('New Terminal'),
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => commands.execute('terminal:create-new')
  });
}

/**
 * The bottom panel's buttons, as on VS Code's panel: the tab bar's built-in
 * "+" (as on the document tabs), opening a new terminal, and a button at
 * the far end that hides the panel. JupyterLab doesn't expose the bottom
 * panel publicly, so this reaches its private panel and does nothing if
 * that is missing.
 */
export function addPanelButtons(
  commands: CommandRegistry,
  shell: ILabShell,
  trans: TranslationBundle
): (enabled: boolean) => void {
  const tabBar = (shell as unknown as { _downPanel?: TabPanel })._downPanel
    ?.tabBar;
  if (!tabBar || !('addButtonEnabled' in tabBar)) {
    return () => undefined;
  }
  tabBar.addRequested.connect(() => {
    void commands.execute('terminal:create-new');
  });
  tabBar.addButtonEnabled = false;
  const button = (tabBar as { addButtonNode?: HTMLElement }).addButtonNode;
  const label = trans.__('New Terminal');
  button?.setAttribute('title', label);
  button?.setAttribute('aria-label', label);

  const hide = document.createElement('button');
  hide.className = 'mpce-PanelHideButton';
  hide.hidden = true;
  const hideLabel = trans.__('Hide Panel');
  hide.setAttribute('title', hideLabel);
  hide.setAttribute('aria-label', hideLabel);
  // The tab bar handles pointer presses to drag tabs; keep this one a click
  hide.addEventListener('pointerdown', event => event.stopPropagation());
  hide.addEventListener('click', () => {
    void commands.execute('monokai-pro-ce:hide-panel');
  });
  tabBar.node.appendChild(hide);

  return enabled => {
    tabBar.addButtonEnabled = enabled;
    hide.hidden = !enabled;
  };
}
