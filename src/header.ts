/**
 * VS Code-style title bar items for the Modern UI: a command center that
 * opens the command palette, and layout toggles for the side panels.
 *
 * Both are JupyterLab top-bar toolbar items (declared in schema/plugin.json),
 * so they can be reordered or disabled like any other toolbar item. They
 * are hidden by style/modern.css unless the Modern UI is on.
 */

import { ILabShell } from '@jupyterlab/application';
import { PageConfig, PathExt } from '@jupyterlab/coreutils';
import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';

const PALETTE = 'apputils:activate-command-palette';

function shortcut(commands: CommandRegistry, command: string): string {
  const binding = commands.keyBindings.find(kb => kb.command === command);
  return binding
    ? binding.keys.map(CommandRegistry.formatKeystroke).join(', ')
    : '';
}

/** A search box in the title bar that opens the command palette. */
export class CommandCenter extends Widget {
  constructor(commands: CommandRegistry) {
    const button = document.createElement('button');
    super({ node: button });
    this.addClass('mpce-CommandCenter');
    button.type = 'button';

    const keys = shortcut(commands, PALETTE);
    button.title = keys ? `Search commands (${keys})` : 'Search commands';
    button.setAttribute('aria-label', button.title);

    // Like VS Code, show the name of the folder JupyterLab was opened in
    const root = PathExt.basename(PageConfig.getOption('serverRoot') || '');
    const icon = document.createElement('span');
    icon.className = 'mpce-CommandCenter-icon';
    const label = document.createElement('span');
    label.className = 'mpce-CommandCenter-label';
    label.textContent = root || 'Search';
    button.append(icon, label);

    button.addEventListener('click', () => void commands.execute(PALETTE));
  }
}

/** Buttons that show and hide the side panels, reflecting their state. */
export class LayoutToggles extends Widget {
  constructor(commands: CommandRegistry, shell: ILabShell) {
    super();
    this.addClass('mpce-LayoutToggles');
    this._shell = shell;

    const sides: ['left' | 'right', string, string][] = [
      ['left', 'application:toggle-left-area', 'Toggle Primary Side Bar'],
      ['right', 'application:toggle-right-area', 'Toggle Secondary Side Bar']
    ];
    for (const [side, command, label] of sides) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mpce-LayoutToggle mpce-mod-${side}`;
      const keys = shortcut(commands, command);
      button.title = keys ? `${label} (${keys})` : label;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', () => void commands.execute(command));
      this.node.appendChild(button);
      this._buttons[side] = button;
    }

    shell.layoutModified.connect(this._sync, this);
    this._sync();
  }

  dispose(): void {
    this._shell.layoutModified.disconnect(this._sync, this);
    super.dispose();
  }

  private _sync(): void {
    this._buttons.left?.setAttribute(
      'aria-pressed',
      String(!this._shell.leftCollapsed)
    );
    this._buttons.right?.setAttribute(
      'aria-pressed',
      String(!this._shell.rightCollapsed)
    );
  }

  private _shell: ILabShell;
  private _buttons: Partial<Record<'left' | 'right', HTMLButtonElement>> = {};
}
