/**
 * Lumino layouts cache each container's padding and border the first time
 * they fit. The Modern UI changes that padding (to open gutters between
 * cards) after the shell has already been laid out, so every container has
 * to be asked to fit again.
 */

import { ILabShell } from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ITerminal, ITerminalTracker } from '@jupyterlab/terminal';
import { CommandRegistry } from '@lumino/commands';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

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
 * methods for this; older releases only have the shell's private panel.
 */
function downArea(shell: ILabShell) {
  const api = shell as unknown as {
    downCollapsed?: boolean;
    collapseDown?: () => void;
    expandDown?: () => void;
  };
  const panel = (shell as unknown as { _downPanel?: Widget })._downPanel;
  return {
    collapsed: () => api.downCollapsed ?? panel?.isHidden ?? false,
    collapse: () => (api.collapseDown ? api.collapseDown() : panel?.hide()),
    expand: () => (api.expandDown ? api.expandDown() : panel?.show())
  };
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

/**
 * VS Code's terminal shortcuts:
 *
 * - toggle (Ctrl+`): open a terminal if there is none; otherwise show and
 *   focus it, or, if it already has focus, hide the bottom panel and return
 *   to the document.
 * - new (Ctrl+Shift+`): open another terminal.
 *
 * Terminals land in the bottom panel when the Modern UI routes them there;
 * otherwise these act on terminals wherever they are.
 */
export function addTerminalCommands(
  commands: CommandRegistry,
  shell: ILabShell,
  terminals: ITerminalTracker
): void {
  // The document to return to when the terminal is hidden
  let lastDocument: Widget | null = null;
  shell.currentChanged.connect((_, { newValue }) => {
    if (newValue && !terminals.has(newValue)) {
      lastDocument = newValue;
    }
  });

  const inPanel = (w: Widget | null) => !!w?.node.closest('#jp-down-stack');
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

  commands.addCommand('monokai-pro-ce:toggle-terminal', {
    label: 'Toggle Terminal',
    execute: async () => {
      const terminal = panelTerminal();
      if (!terminal) {
        await commands.execute('terminal:create-new');
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

  commands.addCommand('monokai-pro-ce:new-terminal', {
    label: 'New Terminal',
    execute: () => commands.execute('terminal:create-new')
  });
}
