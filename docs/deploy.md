% Copyright (c) 2018, Voilà Contributors
% Copyright (c) 2018, QuantStack
%
% Distributed under the terms of the BSD 3-Clause License.
%
% The full license is in the file LICENSE, distributed with this software.

# Deploying Voici

## GitHub Pages

You can easily deploy Voici to GitHub Pages using the [voici-demo](https://github.com/voila-dashboards/voici-demo) template repository.

The template repository contains a GitHub Action that builds the Voici application and deploys it to GitHub Pages. It also contains an `environment.yml` file where you can specify the packages you need. You can also add Notebooks to the `content` folder.

```{video} https://user-images.githubusercontent.com/591645/222892327-2a5b1341-640d-49c2-9e95-1f2d3ec122be.mp4

```

## Standalone

You can also deploy Voici as a standalone application so it can be hosted anywhere using a simple HTTP server.

### Installation

First install Voici by following the [installation instructions](install.md).

You also need to install a kernel for the language you want to use. For example, to use Python, you can install the `jupyterlite-xeus-python` package.
Add it to your dependencies, or install it with the following command:

```bash
pip install jupyterlite-xeus-python
```

### Build

Let's assume you have a folder named `notebooks` with some notebooks in it. To build your Voici application, run the following command:

```bash
voici build --contents notebooks
```

By default this will create a `_output` folder with the content of your Voici application.

You can then serve the content of this folder with a static file server, for example:

```shell
python -m http.server 8000 --directory _output
```

Open the URL `http://localhost:8000` in your browser to access your Voici application.

### Configuration

For further configuration options, see the [configuration documentation](configuration.md).
