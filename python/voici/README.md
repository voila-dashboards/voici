# ![voici](docs/voici-logo.svg)

![Github Actions Status](https://github.com/voila-dashboards/voici/actions/workflows/main.yml/badge.svg)
[![JupyterLite](https://jupyterlite.rtfd.io/en/latest/_static/badge-launch.svg)](https://voici.readthedocs.io/en/latest/_static/lite)
[![Documentation Status](https://readthedocs.org/projects/voici/badge/?version=latest)](https://voici.readthedocs.io/en/latest/?badge=latest)

Voici is a tool for generating static dashboards from Jupyter Notebooks. It can be used as a drop-in replacement for [Voilà](https://github.com/voila-dashboards/voila) and it has the same commands and supports most of Voila's configuration options.

Unlike Voila, which renders interactive dashboards using server-side execution, Voici uses [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) (Wasm) kernels to render notebooks in the browser, making the resulting dashboard entirely self-contained and distributable.

This is made possible thanks to the amazing work done in the [JupyterLite project](https://github.com/jupyterlite/jupyterlite).

https://user-images.githubusercontent.com/591645/222892327-2a5b1341-640d-49c2-9e95-1f2d3ec122be.mp4

## Features 🚀

- Generates self-contained HTML files with embedded Wasm kernels.
- Works offline, without requiring a server to run the dashboard.
- Supports custom templates for styling dashboards, powered by Jinja2.
- Supports all programming languages that have JupyterLite kernels available. _e.g._ the default JavaScript and Python kernels JupyterLite provides, and [xeus kernels](https://github.com/jupyterlite/xeus)

## Python packages provided by voici:

Voici is split between two Python packages:

- The `voici-core` package provides the core functionalities of voici, mainly the voici CLI.
- The `voici` package is a meta-package that depends on both `voici-core` and [`jupyterlite-xeus`](https://github.com/jupyterlite/xeus).

`jupyterlite-xeus` allows you to pre-install packages for running your dashboard. For example, if your dashboard requires Matplotlib you can provide an `environment.yml` file in the folder where you run the voici command, containing the following:

```yml
name: my-dashboard-env
channels:
  - https://repo.mamba.pm/emscripten-forge
  - conda-forge
dependencies:
  - xeus-python
  - matplotlib
```

It has been decided that `voici` would depend on `jupyterlite-xeus` for convenience, **allowing to easily switch from voila to voici without the need to update the Notebook code.**.

Note that you can install multiple xeus kernels like [xeus-python](https://github.com/jupyter-xeus/xeus-python), [xeus-lua](https://github.com/jupyter-xeus/xeus-lua) or [xeus-javascript](https://github.com/jupyter-xeus/xeus-javascript).

```{note}
See the [jupyterlite-xeus documentation](https://jupyterlite-xeus.readthedocs.io/en/latest/) for more information
```

If you would like to use https://github.com/jupyterlite/pyodide-kernel or another non-xeus kernel, you may want to depend on `voici-core` and `jupyterlite-pyodide-kernel` instead.

## Getting Started 🏁

To use Voici, you'll need to install it first:

```bash
pip install voici

# OR BETTER

conda install -c conda-forge voici

# OR EVEN FASTER

mamba install -c conda-forge voici
```

Then, you can generate static dashboards from a notebook or a directory of Notebooks like this:

```bash
# Build a single dashboard
voici my-notebook.ipynb
# Build a directory of notebooks
voici notebooks/
```

Once your dashboards are built, you can simply serve them with a simple static server, _e.g._:

```bash
cd _output
python -m http.server
```

## Advanced usage

The `voici` command line interface is a mix between `voila` and `jupyter lite`. For most cases, users can rely on the `voici` command by using the `voila` CLI syntax.

Voici runs the `build` sub-command by default, the `voici my-notebook.ipynb` command is a shortcut for `voici build --contents my-notebook.ipynb`
For advanced usage, users can invoke `voici` with the `jupyter lite` CLI syntax, _e.g._:

```bash
voici build --contents my-notebook.ipynb
```

The difference between `voici build` and `jupyter lite build` commands is that the voici one will only generate Voici dashboards, excluding the full JupyterLab interface from the output. Running `voici build --contents .` is equivalent to running `jupyter lite build --contents . --apps voici`.

You can generate the classic `jupyter lite` output alongside your dashboards by specifying the additional apps you want:

```bash
voici build --contents . --apps lab --apps retro
```

In order to get some help on how to use the `voici` command, you can run:

```bash
voici --help
```

We'd also suggest looking into the [JupyterLite documentation](https://jupyterlite.readthedocs.io/en/latest/howto/index.html) for more insights on how to configure your `voici` deployment.

## Build the demo site yourself

You will need either [micromamba](https://mamba.readthedocs.io/en/latest/user_guide/micromamba.html), [mamba](https://mamba.readthedocs.io/en/latest) or conda installed in order to build the emscripten environment.

The [demo directory](https://github.com/voila-dashboards/voici/tree/main/demo) contains:

- `notebooks/`: The directory of Notebooks that will be served by Voici
- `environment.yml`: The file specifying the Emscripten environment that will be used for rendering the dashboards, this must contain all your Notebook dependencies

Run the following command to build the demo site:

```bash
git clone https://github.com/voila-dashboards/voici
cd voici/demo

voici notebooks
```

Then serve it!

```bash
cd _output
python -m http.server
```

### Make your own Github pages deployment

Please follow [this guide](https://github.com/voila-dashboards/voici-demo#-how-to-make-your-own-deployment) for making your own Github pages deployment.

## Limitations ⚠️

Because Voici uses Wasm kernels to execute notebooks, there are some limitations to the types of notebooks that can be rendered: Some notebook features may not work correctly or may have limited functionality when rendered in Voici.

## Contributing 👋

If you find a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/voila-dashboards/voici). If you'd like to contribute code, please fork the repository and submit a pull request. We welcome contributions from anyone!
