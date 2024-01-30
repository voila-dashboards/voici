# ![voici](docs/voici-logo.svg)

![Github Actions Status](https://github.com/voila-dashboards/voici/actions/workflows/main.yml/badge.svg)
[![JupyterLite](https://jupyterlite.rtfd.io/en/latest/_static/badge-launch.svg)](https://voici.readthedocs.io/en/latest/_static/lite)
[![Documentation Status](https://readthedocs.org/projects/voici/badge/?version=latest)](https://voici.readthedocs.io/en/latest/?badge=latest)

The `voici-core` package provides the core functionality for building voici dashboards using the voici CLI.

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
