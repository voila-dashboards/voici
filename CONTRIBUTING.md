# Contributing

Thank you for contributing to Voici!

Make sure to follow [Project Jupyter's Code of Conduct](https://github.com/jupyter/governance/blob/master/conduct/code_of_conduct.md)
for a friendly and welcoming collaborative environment.

## Setting up a development environment

Note: You will need NodeJS to build the extension package.

**Note**: we recommend using `mamba` to speed the creating of the environment.

```bash
# create a new environment
mamba env create -f environment.yml

# activate the environment
mamba activate voici-dev

# Install package in development mode
pip install -e python/voici-core
pip install -e python/voici
```

`voici` follows a monorepo structure. To build all the packages at once you can run the following command:

```bash
cd python/voici-core

# install dependencies
jlpm build
```

Then go to the `demo` folder and run the following command to build the demo application with Voici:

```bash
cd ../../demo

# build the demo
voici build --contents notebooks
```

Finally, run the following command to start the demo application:

```bash
python -m http.server --directory _output
```

Open a web browser and navigate to `http://localhost:8000` to access the demo application.

## UI Tests

There are also end to end tests to cover higher level user interactions, located in the `ui-tests` folder. To run these tests:

```bash
cd ui-tests

# install dependencies
jlpm

# install a browser
jlpm playwright install chromium

# start the application
jlpm start

# in another terminal, run the tests
jlpm test
```

The `test` script calls the Playwright test runner. You can pass additional arguments to `playwright` by appending parameters to the command. For example to run the test in headed mode, `jlpm test --headed`.

Checkout the [Playwright Command Line Reference](https://playwright.dev/docs/test-cli/) for more information about the available command line options.

### Updating reference snapshots

Often a PR might make changes to the user interface, which can cause the visual regression tests to fail.

If you want to update the reference snapshots while working on a PR you can post the following sentence as a GitHub comment:

```bash
bot please update playwright snapshots
```

This will trigger a GitHub Action that will run the UI tests automatically and push new commits to the branch if the reference snapshots have changed.

## Documentation

First, follow the instructions above to set up a development environment.

Then, install the docs dependencies:

```bash
pip install myst-parser pydata-sphinx-theme sphinx sphinx-autobuild sphinxcontrib-video
```

Then, to build the documentation:

```bash
sphinx-build -W -b html docs docs/build/html
```

In a separate terminal, start the documentation server:

```bash
python -m http.server --directory docs/build/html
```

You can also build and watch the documentation using the following command:

```bash
sphinx-autobuild -W -b html docs docs/build/html --host 0.0.0.0
```

Then open a web browser and navigate to `http://localhost:8000` to access the documentation.

## Contributing from the browser

Alternatively you can also contribute to Voici without setting up a local environment, directly from a web browser:

- GitHub’s [built-in editor](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files) is suitable for contributing small fixes
- A more advanced [github.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor) editor can be accessed by pressing the dot (.) key while in the Voici GitHub repository,
