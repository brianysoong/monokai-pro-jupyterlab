# Contributing

## How the theme is put together

| Path                  | What it holds                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `style/palette.css`   | The official Monokai Pro and Monokai Pro Light palettes, plus semantic tokens (panel, highlight, layers). All other files refer to these tokens. |
| `style/variables.css` | Maps every JupyterLab `--jp-*` variable onto the palette. One mapping serves both variants.                                                      |
| `style/syntax.css`    | Token colors for the editor and rendered Markdown, and ANSI colors.                                                                              |
| `style/ui.css`        | Component refinements that variables can't express: tabs, the activity bar, selection, menus, dialogs and figures.                               |
| `src/index.ts`        | Registers both themes, the editor extension, terminal colors and the settings.                                                                   |
| `src/syntax.ts`       | Adds finer token classes (`mpce-tok-*`) and Python semantic classes (`mpce-sem-*`) for the CSS to style.                                         |
| `src/terminal.ts`     | Applies the ANSI palette to terminals.                                                                                                           |

Both variants live in one stylesheet. While a Monokai theme is active, `src/index.ts` sets `data-mpce-theme="dark"` or `"light"` on `<html>`, and every rule is scoped to that attribute.

## Development install

You need Node.js to build the extension. The `jlpm` command is JupyterLab's pinned copy of yarn.

```bash
python -m venv .venv
source .venv/bin/activate
pip install --editable ".[dev]"
jupyter labextension develop . --overwrite
jlpm build
```

Then run `jlpm watch` in one terminal and `jupyter lab` in another, and reload the page after each change.

## Before committing

The built extension in `jupyterlab_monokai_pro_ce/labextension` is committed, so that `pip install git+...` works without Node.js. Rebuild it in production mode and commit it together with your source changes. CI fails if the two don't match.

```bash
jlpm lint
jlpm build:prod
```
