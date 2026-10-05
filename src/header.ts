/**
 * VS Code-style title bar items for the Modern UI: a command center that
 * opens the command palette, and layout toggles for the side panels.
 *
 * Both are JupyterLab top-bar toolbar items (declared in schema/plugin.json),
 * so they can be reordered or disabled like any other toolbar item. They
 * are hidden by style/modern.css unless the Modern UI is on.
 * TitleBarLayout keeps them and the menus on one row in narrow windows.
 */

import { ILabShell } from '@jupyterlab/application';
import { PageConfig, PathExt } from '@jupyterlab/coreutils';
import { CommandRegistry } from '@lumino/commands';
import { Menu, MenuBar, Widget } from '@lumino/widgets';

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

/**
 * VS Code's compact menu: a single button that opens every main menu as a
 * submenu. Shown by TitleBarLayout once the menu bar no longer fits.
 */
export class MenuButton extends Widget {
  constructor(commands: CommandRegistry, shell: ILabShell) {
    const button = document.createElement('button');
    super({ node: button });
    this.addClass('mpce-MenuButton');
    button.type = 'button';
    button.title = 'Application Menu';
    button.setAttribute('aria-label', 'Application Menu');
    button.setAttribute('aria-haspopup', 'menu');
    button.addEventListener('click', () => this._open(commands, shell));
  }

  private _open(commands: CommandRegistry, shell: ILabShell): void {
    const menuBar = firstWidget(shell, 'menu');
    if (!(menuBar instanceof MenuBar)) {
      return;
    }
    const menu = new Menu({ commands });
    menu.addClass('mpce-CompactMenu');
    for (const submenu of menuBar.menus) {
      menu.addItem({ type: 'submenu', submenu });
    }
    // Only borrow the submenus; never dispose them with the compact menu
    menu.aboutToClose.connect(() =>
      requestAnimationFrame(() => {
        menu.clearItems();
        menu.dispose();
      })
    );
    const rect = this.node.getBoundingClientRect();
    menu.open(rect.left, rect.bottom + 4);
  }
}

function firstWidget(shell: ILabShell, area: 'menu'): Widget | null {
  for (const widget of shell.widgets(area)) {
    return widget;
  }
  return null;
}

type CommandCenterMode = 'centered' | 'inline' | 'icon';

/**
 * Keeps the Modern UI title bar on one row as the window narrows, giving up
 * space in priority order, as VS Code's title bar does:
 *
 * 1. the command center sits centered in the window while it fits;
 * 2. otherwise it moves into the free space between the menus and the
 *    toggles, shrinking down to a minimum width;
 * 3. then it collapses to an icon-only search button;
 * 4. then the menu bar collapses into a single menu button (VS Code's
 *    compact menu), which may give the command center room again;
 * 5. below MIN_TOGGLES_WIDTH the side-panel toggles hide (they remain in
 *    the View menu).
 *
 * The chosen modes are written to `data-mpce-cc` and `data-mpce-menu` on
 * the top panel for the CSS.
 */
export class TitleBarLayout {
  static readonly IDEAL_MIN = 200;
  static readonly IDEAL_MAX = 560;
  static readonly INLINE_MIN = 180;
  static readonly ICON_WIDTH = 28;
  static readonly GAP = 12;
  static readonly MIN_TOGGLES_WIDTH = 480;

  constructor(shell: ILabShell) {
    this._shell = shell;
    this._observer = new ResizeObserver(() => this._schedule());
    // Query the shell's own node: plugins activate before the shell is
    // attached to the document
    // Re-run when the window resizes and when the menus first render (the
    // menu bar is laid out before its items have a size)
    for (const selector of ['#jp-top-panel', '#jp-MainMenu']) {
      const node = this._find(selector);
      if (node) {
        this._observer.observe(node);
      }
    }
    // Toolbar items (including our own) arrive after settings load
    const topBar = this._find('#jp-top-bar');
    if (topBar) {
      new MutationObserver(() => this._schedule()).observe(topBar, {
        childList: true
      });
    }
  }

  private _find(selector: string): HTMLElement | null {
    return this._shell.node.querySelector<HTMLElement>(selector);
  }

  /** Re-run the layout, e.g. after the Modern UI was switched on or off. */
  refresh(): void {
    this._schedule();
  }

  private _schedule(): void {
    if (this._frame) {
      return;
    }
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      this._layout();
    });
  }

  /** Width of the full menu bar, remembered while it is collapsed. */
  private _naturalMenuWidth(): number {
    const menuBar = firstWidget(this._shell, 'menu');
    let width = 0;
    menuBar?.node
      .querySelectorAll<HTMLElement>('.lm-MenuBar-item')
      .forEach(item => (width += item.offsetWidth));
    if (width) {
      this._menuWidth = width;
    }
    return this._menuWidth;
  }

  /**
   * Place the command center between `left` and `right` (window x
   * coordinates), centered in the window when it fits.
   */
  private _placeCommandCenter(
    width: number,
    left: number,
    right: number
  ): [CommandCenterMode, number] {
    const { IDEAL_MIN, IDEAL_MAX, INLINE_MIN, ICON_WIDTH } = TitleBarLayout;
    const ideal = Math.min(IDEAL_MAX, Math.max(IDEAL_MIN, width * 0.32));
    if (width / 2 - ideal / 2 >= left && width / 2 + ideal / 2 <= right) {
      return ['centered', ideal];
    }
    if (right - left >= INLINE_MIN) {
      return ['inline', Math.min(ideal, right - left)];
    }
    return ['icon', ICON_WIDTH];
  }

  private _layout(): void {
    const panel = this._find('#jp-top-panel');
    if (!panel) {
      return;
    }
    if (!document.documentElement.hasAttribute('data-mpce-modern')) {
      delete panel.dataset.mpceCc;
      delete panel.dataset.mpceMenu;
      panel.removeAttribute('data-mpce-narrow');
      panel.style.removeProperty('--mm-cc-width');
      return;
    }

    const { ICON_WIDTH, GAP } = TitleBarLayout;
    const width = panel.clientWidth;
    const narrow = width < TitleBarLayout.MIN_TOGGLES_WIDTH;
    const logo = this._find('#jp-MainLogo')?.offsetWidth ?? 0;
    // Remember the toggles' width: it reads 0 while they are hidden
    const togglesNode = panel.querySelector<HTMLElement>('.mpce-LayoutToggles');
    if (togglesNode?.offsetWidth) {
      this._togglesWidth = togglesNode.offsetWidth;
    }
    const right = width - (narrow ? 0 : this._togglesWidth) - GAP;
    const menu = this._naturalMenuWidth();

    // Full menu bar if it fits next to at least an icon-only search button,
    // otherwise the compact menu button
    const compact = logo + menu + GAP + ICON_WIDTH > right;
    const [mode, ccWidth] = this._placeCommandCenter(
      width,
      logo + (compact ? ICON_WIDTH : menu) + GAP,
      right
    );
    panel.dataset.mpceCc = mode;
    panel.dataset.mpceMenu = compact ? 'compact' : 'full';
    panel.toggleAttribute('data-mpce-narrow', narrow);
    panel.style.setProperty('--mm-cc-width', `${Math.round(ccWidth)}px`);
  }

  private _shell: ILabShell;
  private _observer: ResizeObserver;
  private _frame = 0;
  private _menuWidth = 0;
  private _togglesWidth = 0;
}
