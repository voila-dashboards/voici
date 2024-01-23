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
- Supports all programming languages that have JupyterLite kernels available. _e.g._ the default JavaScript and Python kernels JupyterLite provides, [python, lua or nelson with xeus](https://github.com/jupyterlite/xeus)

## Getting Started 🏁

To use Voici, you'll need to install it first:

```bash
pip install voici-core

# OR BETTER

conda install -c conda-forge voici-core

# OR EVEN FASTER

mamba install -c conda-forge voici-core
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

## Limitations ⚠️

Because Voici uses Wasm kernels to execute notebooks, there are some limitations to the types of notebooks that can be rendered: Some notebook features may not work correctly or may have limited functionality when rendered in Voici.

## Contributing 👋

If you find a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/voila-dashboards/voici). If you'd like to contribute code, please fork the repository and submit a pull request. We welcome contributions from anyone!
