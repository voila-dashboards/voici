# Configuring Voici

## Templates

You can use different templates for your Voici application.

Templates can modify the layout and the appearance of your Voici application. Here are a few template examples:

- [Voila Material](https://github.com/voila-dashboards/voila-material): Material design template for Voilà
- [Voila GridStack](https://github.com/voila-dashboards/voila-gridstack): Dashboard template for Voilà based on GridStackJS

These templates were originally developed for Voilà, but they can also be used with Voici.

To install a template, you can use the `pip` command:

```bash
pip install voila-material
```

You can also add the template to your dependencies in the `environment.yml` file:

```yaml
dependencies:
  - voila-material
```

Once the template is installed, you can use it by specifying the `--template` option when building your Voici application:

```bash
voici build --template voila-material
```

Here is what a Voici dashboard looks like with the Material template:

![a screenshot showing a Voici dashboard with the Material template](https://user-images.githubusercontent.com/591645/231569683-7df59ff8-239e-4dee-ad15-3208e0b9c761.png)

## Themes

You can also use different themes for your Voici application.

To use the Dark theme, you can use the `--theme` option when building your Voici application:

```bash
voici build --theme dark
```

You can also the `?theme` query parameter to choose the theme while accessing the dashboard. For example:

```text
https://you-voici-deployment.example.com/voici/render/voici.html?theme=dark
```

## Additional Configuration

Voici supports additional configuration provided by JupyterLite, such as using custom extensions and settings.

You can refer to the [JupyterLite documentation](https://jupyterlite.readthedocs.io/en/latest/howto/index.html) for more information.

```{warning}
Some configuration options might not supported yet.
Please don't hesitate to open an issue on the [Voici repository](https://github.com/voila-dashboards/voici)
if you would like to use an option not supported by Voici yet.
```
