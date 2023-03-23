# Making a new release of Voici

The recommended way to make a release is to use [`jupyter_releaser`](https://jupyter-releaser.readthedocs.io/en/latest/get_started/making_release_from_repo.html).

This repository contains the two workflows located under https://github.com/voila-dashboards/voici/actions:

- Step 1: Prep Release
- Step 2: Publish Release

### Specifying a version spec

The `next` version spec is supported and will bump the packages as follows. For example:

- `0.1.0a0` -> `0.1.0a1`
- `0.1.0b7` -> `0.1.0b8`
- `0.1.0` -> `0.1.1`

You can also specify the Python version directly as the `version_spec` when using the
releaser workflows. For example:

- `0.1.0b8`
- `0.1.1`
- `1.2.0rc0`
