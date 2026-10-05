# Monokai Pro (Community Edition) for [JupyterLab](https://jupyter.org)

## Installation instructions

Install into the Python environment that runs JupyterLab (4.0 or newer). The repository ships the built extension, so Node.js is not needed. That makes it suitable for HPC clusters and other shared machines:

```bash
pip install git+https://github.com/brianysoong/monokai-pro-jupyterlab.git
```

To update, reinstall. The version number doesn't change between commits, so tell pip to reinstall anyway:

```bash
pip install --force-reinstall --no-deps git+https://github.com/brianysoong/monokai-pro-jupyterlab.git
```

#### Machines without internet access

Installing from git needs internet access, to reach GitHub and to download the package's build tools. For an offline machine, build a wheel on a machine that has access:

```bash
pip wheel --no-deps -w dist git+https://github.com/brianysoong/monokai-pro-jupyterlab.git
```

Then copy the `.whl` file from `dist/` over and install it. Installing a wheel needs nothing from the internet:

```bash
pip install jupyterlab_monokai_pro_ce-*.whl
```

#### Removing it

To remove the theme:

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
