from copy import deepcopy
from functools import partial
from io import StringIO
from pathlib import Path
from typing import Dict, List, Tuple, Any

import jinja2
from jupyter_server.utils import url_escape, url_path_join
from nbconvert.exporters.html import HTMLExporter
from voila.configuration import VoilaConfiguration
from voila.utils import include_lab_theme, filter_extension

from .exporter import VoiciExporter


def path_to_content(path: Path, relative_to: Path):
    """Create a partial contents dictionary (in the sense of jupyter server) from a given path."""
    if path.is_dir():
        content = [
            path_to_content(subitem, relative_to)
            for subitem in path.iterdir()
            if subitem is not None
        ]
        content = [subcontent for subcontent in content if subcontent is not None]
        content = sorted(content, key=lambda i: i['name'])

        return dict(
            type='directory',
            name=path.stem,
            path=str(path.relative_to(relative_to)),
            content=content,
        )
    if path.is_file() and path.suffix == '.ipynb':
        return dict(
            type='notebook',
            name=path.name,
            path=str(path.relative_to(relative_to)).replace('.ipynb', '.html'),
        )
    return None


def patch_page_config(
    page_config: Dict, relative_path: Path, config: VoilaConfiguration
):
    """Update page config JSON to use ``voici` paths."""
    page_config_copy = deepcopy(page_config)

    voici_prefix = '../' * (1 + len(relative_path.parts))
    base_prefix = f'../{voici_prefix}'

    # emulate upstream ``config-utils.js``
    patch_relative_urls(page_config_copy, base_prefix)

    page_config_copy.update(
        # Align the base URL with the relative path
        baseUrl=base_prefix,
        # Grabbing from the Voici static folder
        fullStaticUrl=f'{voici_prefix}build',
        # Grabbing from the jupyterlite static folders
        settingsUrl=f'{base_prefix}build/schemas',
        fullLabextensionsUrl=f'{base_prefix}extensions',
        # The Themes URL will be joined with the base URL in the
        # JupyterLite main application
        themesUrl='./build/themes',
    )

    if config.theme == 'light':
        themeName = 'JupyterLab Light'
    elif config.theme == 'dark':
        themeName = 'JupyterLab Dark'
    else:
        themeName = config.theme
    page_config_copy['jpThemeName'] = themeName
    page_config_copy['extensionConfig'] = config.extension_config
    federated_extensions = page_config_copy['federated_extensions']
    disabled_extensions = [
        '@voila-dashboards/jupyterlab-preview',
        '@jupyter/collaboration-extension',
        '@jupyter-widgets/jupyterlab-manager',
    ]
    page_config_copy['federated_extensions'] = filter_extension(
        federated_extensions=federated_extensions,
        disabled_extensions=disabled_extensions,
    )
    return page_config_copy


def patch_relative_urls(config_dict: Dict[str, Any], path_prefix: str) -> None:
    """Update one ``page_config`` object in place with relative URLs.

    See: https://github.com/jupyterlite/jupyterlite/blame/v0.7.0b1/app/config-utils.js
    """
    for key, value in config_dict.items():
        if key in ['licensesUrl', 'themesUrl', 'federated_extensions']:
            # these are left unchanged, as they are handled in upstream JS code
            continue
        elif isinstance(value, dict):
            # nested config objects may also contain relative paths
            patch_relative_urls(value, path_prefix)
        elif key.endswith('Url') and isinstance(value, str) and value.startswith('./'):
            config_dict[key] = f'{path_prefix}{value[2:]}'
        elif key.endswith('Urls') and isinstance(value, list):
            config_dict[key] = [
                f'{path_prefix}{v[2:]}' if v.startswith('./') else v for v in value
            ]


class VoiciTreeExporter(HTMLExporter):
    def __init__(
        self,
        jinja2_env: jinja2.Environment,
        voici_configuration: VoilaConfiguration,
        **kwargs,
    ):
        self.jinja2_env = self._environment_cached = jinja2_env
        self.voici_configuration = voici_configuration

        self.theme = voici_configuration.theme
        self.template_name = voici_configuration.template

        self.notebook_paths = []
        self.resources = self._init_resources()

    def _init_resources(self):
        resources = super()._init_resources({})
        resources['include_lab_theme'] = partial(include_lab_theme, None)
        resources['theme'] = self.validate_theme(self.theme, False)

        return resources

    def allowed_content(self, content: Dict) -> bool:
        return content['type'] == 'notebook' or content['type'] == 'directory'

    def generate_breadcrumbs(self, path: Path, depth: int) -> List:
        root = '../../' + '../' * depth
        breadcrumbs = [(url_path_join(root, 'voici/tree'), '')]
        parts = path.parts

        for i in range(len(parts)):
            if parts[i]:
                link = url_path_join(
                    root,
                    'voici/tree',
                    url_escape(url_path_join(*parts[: i + 1])),
                )
                breadcrumbs.append((link, parts[i]))

        return breadcrumbs

    def generate_page_title(self, path: Path) -> str:
        parts = path.parts
        if len(parts) > 3:  # not too many parts
            parts = parts[-2:]
        page_title = url_path_join(*parts)
        if page_title:
            return page_title + '/'
        else:
            return 'Voici Home'

    def will_render_tree(self, template, contents, page_title, breadcrumbs, relative_path):
        """Return a function that will render the tree into a StringIO and return it."""

        def render_tree(page_config) -> StringIO:
            page_config = patch_page_config(page_config, relative_path, self.voici_configuration)
            return StringIO(
                template.render(
                    frontend='voici',
                    contents=contents,
                    page_title=page_title,
                    breadcrumbs=breadcrumbs,
                    page_config=page_config,
                    base_url=page_config['baseUrl'],
                    **self.resources,
                )
            )

        return render_tree

    def will_render_notebook(self, notebook_path, relative_path, notebook_file_path):
        """Return a function that will render the notebook into a StringIO and return it."""

        def render_notebook(page_config) -> StringIO:
            page_config = patch_page_config(page_config, relative_path, self.voici_configuration)
            # Pass the notebook path to the frontend so the kernel can set the correct working directory
            page_config['notebookPath'] = notebook_file_path

            depth = len(relative_path.parts) if str(relative_path) != '.' else 0
            files_url_prefix = '../' * (2 + depth) + 'files/'
            if str(relative_path) != '.':
                files_url_prefix += str(relative_path) + '/'

            voici_exporter = VoiciExporter(
                voici_config=self.voici_configuration,
                page_config=page_config,
                base_url=page_config['baseUrl'],
                notebook_path=str(notebook_path),
                files_url_prefix=files_url_prefix,
            )

            return StringIO(voici_exporter.from_filename(notebook_path)[0])

        return render_notebook

    def generate_contents(
        self, path: Path, lite_files_output: Path, relative_to=None
    ) -> Tuple[Dict, List[str]]:
        """Generate the Tree content.
        This is a generator method that generates tuples (filepath, filecreation_function).
        """
        if relative_to is None:
            relative_to = path
            relative_path = Path('.')
            breadcrumbs = []
        else:
            relative_path = path.relative_to(relative_to)
            breadcrumbs = self.generate_breadcrumbs(relative_path, len(relative_path.parts))
        classic_tree = self.voici_configuration.classic_tree
        template_name = 'tree-lab.html' if not classic_tree else 'tree.html'

        template = self.jinja2_env.get_template(template_name)

        page_title = self.generate_page_title(path)

        contents = path_to_content(path, relative_to)

        if contents is None:
            return

        yield (
            Path('tree') / relative_path / 'index.html',
            self.will_render_tree(template, contents, page_title, breadcrumbs, relative_path),
        )

        for file in contents.get('content', []):
            if file['type'] == 'notebook':
                notebook_file_path = file['path'].replace('.html', '.ipynb')
                yield (
                    Path('render') / file['path'],
                    self.will_render_notebook(
                        lite_files_output / notebook_file_path,
                        relative_path,
                        notebook_file_path,
                    ),
                )
            elif file['type'] == 'directory':
                for subcontent in self.generate_contents(
                    path / file['name'], lite_files_output, relative_to
                ):
                    yield subcontent

    def validate_theme(self, theme: str, classic_tree: bool) -> str:
        """Check the compatibility between the requested theme and the tree page"""
        if classic_tree:
            supported_themes = ['dark', 'light', 'JupyterLab Dark', 'JupyterLab Light']
            if theme not in supported_themes:
                self.log.warn('Custom JupyterLab theme is not supported in the classic tree')
                return 'light'
            else:
                if theme == 'JupyterLab Dark':
                    return 'dark'
                if theme == 'JupyterLab Light':
                    return 'light'
        return theme
