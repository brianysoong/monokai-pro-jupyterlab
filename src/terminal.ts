/**
 * Monokai Pro ANSI colors for terminals.
 *
 * JupyterLab's "inherit" terminal theme takes the background, foreground,
 * cursor and selection from the page, but leaves the 16 ANSI colors at
 * xterm.js defaults (whose dark blue is hard to read on Monokai's
 * background). This fills them in from the `--mpce-ansi-*` variables in
 * syntax.css whenever JupyterLab (re)applies the terminal theme.
 *
 * xterm.js is not exposed publicly by JupyterLab, so this reaches the
 * terminal's private `_term` and does nothing if it is not there.
 */

import { ITerminal, ITerminalTracker } from '@jupyterlab/terminal';

type Xterm = { options: { theme?: Record<string, string> } };

const ANSI_COLORS: [string, string][] = [
  ['black', 'black'],
  ['red', 'red'],
  ['green', 'green'],
  ['yellow', 'yellow'],
  ['blue', 'blue'],
  ['magenta', 'magenta'],
  ['cyan', 'cyan'],
  ['white', 'white'],
  ['brightBlack', 'bright-black'],
  ['brightRed', 'red'],
  ['brightGreen', 'green'],
  ['brightYellow', 'yellow'],
  ['brightBlue', 'blue'],
  ['brightMagenta', 'magenta'],
  ['brightCyan', 'cyan'],
  ['brightWhite', 'white']
];

function applyAnsiColors(terminal: ITerminal.ITerminal): void {
  const xterm = (terminal as unknown as { _term?: Xterm })._term;
  if (
    !xterm?.options ||
    !document.documentElement.dataset.mpceTheme ||
    terminal.getOption('theme') !== 'inherit'
  ) {
    return;
  }
  const style = getComputedStyle(document.documentElement);
  const colors: Record<string, string> = {};
  for (const [key, name] of ANSI_COLORS) {
    const value = style.getPropertyValue(`--mpce-ansi-${name}`).trim();
    if (value) {
      colors[key] = value;
    }
  }
  xterm.options.theme = { ...xterm.options.theme, ...colors };
}

function watch(widget: { content: ITerminal.ITerminal }): void {
  // `ready` and `themeChanged` are missing from older JupyterLab 4 releases
  const terminal = widget.content as ITerminal.ITerminal & {
    ready?: Promise<void>;
  };
  void (terminal.ready ?? Promise.resolve()).then(() =>
    applyAnsiColors(terminal)
  );
  // JupyterLab replaces the whole xterm theme on every theme change
  terminal.themeChanged?.connect(() => applyAnsiColors(terminal));
}

export function themeTerminals(tracker: ITerminalTracker): void {
  tracker.forEach(watch);
  tracker.widgetAdded.connect((_, widget) => watch(widget));
}
