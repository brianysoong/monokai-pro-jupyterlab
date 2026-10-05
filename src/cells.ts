/**
 * VS Code-style run button in the notebook gutter.
 *
 * The button itself is drawn by style/modern.css as a pseudo-element at the
 * top of each code cell's input prompt, so it survives JupyterLab
 * re-rendering the prompt. This module only handles clicks on it: one
 * delegated listener per notebook, active only while the Modern UI is on.
 */

import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';

/** Height of the button area at the top of the prompt, in px. */
const BUTTON_HEIGHT = 26;

export function enableGutterRunButtons(tracker: INotebookTracker): void {
  tracker.widgetAdded.connect((_, panel) => {
    panel.content.node.addEventListener('click', event => {
      if (!document.documentElement.hasAttribute('data-mpce-modern')) {
        return;
      }
      const prompt = (event.target as HTMLElement).closest?.(
        '.jp-CodeCell .jp-InputPrompt'
      );
      if (
        !prompt ||
        event.clientY - prompt.getBoundingClientRect().top > BUTTON_HEIGHT
      ) {
        return;
      }
      const notebook = panel.content;
      const index = notebook.widgets.findIndex(cell =>
        cell.node.contains(prompt)
      );
      if (index < 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      notebook.activeCellIndex = index;
      notebook.deselectAll();
      void NotebookActions.run(notebook, panel.sessionContext);
    });
  });
}
