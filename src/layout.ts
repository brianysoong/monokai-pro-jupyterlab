/**
 * Lumino layouts cache each container's padding and border the first time
 * they fit. The Modern UI changes that padding (to open gutters between
 * cards) after the shell has already been laid out, so every container has
 * to be asked to fit again.
 */

import { ILabShell } from '@jupyterlab/application';
import { ITerminalTracker } from '@jupyterlab/terminal';
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
      shell.activateById(widget.id);
    }
  });
}
