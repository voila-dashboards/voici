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
```

Then, you can generate static dashboards from a directory of Notebooks like this:

```bash
voici build . --contents notebooks/
```

Once your dashboards built, you can simply serve them with a simple static server, *e.g.*:

```bash
cd _output
python -m http.server
```

The `voici` command line interface is the same as the `jupyter lite` one. The only difference is that the `voici build` command will only generate Voici dashboards, excluding the full JupyterLab interface from the output. Running `voici build .` is equivalent to running `jupyter lite build . --apps voici`
You can generate the classic `jupyter lite` output alongside your dashboards by specifying the additional apps you want:

```bash
voici build . --apps lab --apps retro
```

In order to get some help on how to use the `voici` command, you can run:

```bash
voici --help
```

We'd also suggest looking into the [JupyterLite documentation](https://jupyterlite.readthedocs.io/en/latest/howto/index.html) for more insights on how to configure your `voici` deployment.

-->

## Limitations ⚠️

Because Voici uses wasm kernels to execute notebooks, there are some limitations to the types of notebooks that can be rendered: Some notebook features may not work correctly or may have limited functionality when rendered in Voici.

## Contributing 👋

If you find a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/voila-dashboards/voici). If you'd like to contribute code, please fork the repository and submit a pull request. We welcome contributions from anyone!
