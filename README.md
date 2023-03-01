# Voici

🚧 **WARNING: Voici is still a work in progress and should not be used for production workloads.** 🚧

Voici is a tool for generating static dashboards from Jupyter Notebooks. Unlike [Voilà](https://github.com/voila-dashboards/voila), which renders interactive dashboards using server-side execution, Voici uses WebAssembly (wasm) kernels to render notebooks in the browser, making the resulting dashboard entirely self-contained and distributable.

This is made possible thanks to the amazing work done in the [JupyterLite project](https://github.com/jupyterlite/jupyterlite).

## Features 🚀

- Generates self-contained HTML files with embedded wasm kernels.
- Works offline, without requiring a server to run the dashboard.
- Supports custom templates for styling dashboards, powered by Jinja2.
- Supports all programming languages that have JupyterLite kernels available. _e.g._ the default JavaScript and Python kernels JupyterLite provides, [python with xeus-python](https://github.com/jupyterlite/xeus-python-kernel), [lua](https://github.com/jupyterlite/xeus-lua-kernel), [nelson](https://github.com/jupyterlite/xeus-nelson-kernel)

<!-- ## Getting Started 🏁

To use Voici, you'll need to install it first:

```bash
pip install voici
``` -->

## Limitations ⚠️

Because Voici uses wasm kernels to execute notebooks, there are some limitations to the types of notebooks that can be rendered: Some notebook features may not work correctly or may have limited functionality when rendered in Voici.

## Contributing 👋

If you find a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/voila-dashboards/voici). If you'd like to contribute code, please fork the repository and submit a pull request. We welcome contributions from anyone!
