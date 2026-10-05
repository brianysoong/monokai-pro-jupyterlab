/**
 * Lumino layouts cache each container's padding and border the first time
 * they fit. The Modern UI changes that padding (to open gutters between
 * cards) after the shell has already been laid out, so every container has
 * to be asked to fit again.
 */

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
