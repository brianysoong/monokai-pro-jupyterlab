# Monokai Pro (Community Edition) for [JupyterLab](https://jupyter.org)

## Installation instructions

Install into the Python environment that runs JupyterLab (4.0 or newer). The repository ships the built extension, so Node.js is not needed. That makes it suitable for HPC clusters and other shared machines:

```bash
pip install git+https://github.com/brianysoong/monokai-pro-jupyterlab.git
```

If you can't reach GitHub from the machine, clone the repository somewhere you can, copy it over, and install from the folder:

```bash
pip install ./monokai-pro-jupyterlab
```

To update, run the `pip install` command again with `--upgrade`. To remove the theme:

```bash
pip uninstall jupyterlab_monokai_pro_ce
```

### Activating theme

1. Restart JupyterLab (or reload the page if it is already running elsewhere).
2. Choose _Settings → Theme → Monokai Pro (CE)_, or _Monokai Pro Light (CE)_.
3. Optional: set _Settings → Theme → Theme Scrollbars_ so the scrollbars use the theme colors too.

### Using it on every machine

JupyterLab stores the theme choice in `~/.jupyter/lab/user-settings`. To make Monokai Pro the default wherever the package is installed, add this to `<env>/share/jupyter/lab/settings/overrides.json`:

```json
{
  "@jupyterlab/apputils-extension:themes": {
    "theme": "Monokai Pro (CE)"
  }
}
```

### Modern UI

To get the VS Code-style layout, open _Settings → Settings Editor → Monokai Pro (CE)_ and turn on **Modern UI**. Two related settings default to on: **Use VS Code icons** and **Open terminals in the bottom panel**. To make the Modern UI the default on a machine, add it to the same `overrides.json`:

```json
{
  "@jupyterlab/apputils-extension:themes": {
    "theme": "Monokai Pro (CE)"
  },
  "jupyterlab-monokai-pro-ce:plugin": {
    "modernUI": true
  }
}
```

### Figure background

In the dark theme, image outputs get a white backing so transparent plots with dark text stay readable. To change this, open _Settings → Settings Editor → Monokai Pro (CE) → Figure background_ and choose `White`, `Auto` (only figures that ask for it) or `None`.
