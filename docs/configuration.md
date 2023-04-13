# Configuring Voici

## Templates

You can different templates for your Voici application.

Templates can modify the layout and the appearance of your Voici application. Here are a few template examples:

- [Voila Material](https://github.com/voila-dashboards/voila-material): Material design template for Voilà
- [Voila Vuetify](https://github.com/voila-dashboards/voila-vuetify): Dashboard template for Voilà based on VuetifyJS

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
