from copy import deepcopy
from io import StringIO
import os
from typing import Dict, List, Tuple
from pathlib import Path

import jinja2

import nbformat

from jupyter_server.services.contents.filemanager import FileContentsManager
from jupyter_server.utils import url_path_join, url_escape

from voila.configuration import VoilaConfiguration
from voila.utils import create_include_assets_functions

from .utils import find_all_lab_theme


class VoiciTreeExporter:
    def __init__(
        self,
        jinja2_env: jinja2.Environment,
        voici_configuration: VoilaConfiguration,
        base_url: str,
        **kwargs,
    ):
        self.jinja2_env = jinja2_env
        self.base_url = base_url
        self.voici_configuration = voici_configuration
        self.theme = voici_configuration.theme
        self.template_name = voici_configuration.template

        self.notebook_paths = []

        self.page_config = kwargs.get('page_config', {})

    def allowed_content(self, content: Dict) -> bool:
        return content['type'] == 'notebook' or content['type'] == 'directory'

    def generate_breadcrumbs(self, path: Path) -> List:
        breadcrumbs = [(url_path_join(self.base_url, 'voila/tree'), '')]
        parts = str(path).split('/')
        for i in range(len(parts)):
            if parts[i]:
                link = url_path_join(
                    self.base_url,
                    'voila/tree',
                    url_escape(url_path_join(*parts[: i + 1])),
                )
                breadcrumbs.append((link, parts[i]))
        return breadcrumbs

    def generate_page_title(self, path: Path) -> str:
        parts = str(path).split('/')
        if len(parts) > 3:  # not too many parts
            parts = parts[-2:]
        page_title = url_path_join(*parts)
        if page_title:
            return page_title + '/'
        else:
            return 'Voici Home'

    def generate_contents(self, path='', relative_to=None) -> Tuple[Dict, List[str]]:
        """Generate the Tree content. This is a generator method that generates tuples (filepath, file)."""
        if relative_to is None:
            relative_to = path
            relative_path = Path('')
        else:
            relative_path = Path(path).relative_to(relative_to)

        self.resources = self.init_resources()
        self.template = self.jinja2_env.get_template('tree.html')

        # TODO Get rid of content manager which does not work and grab files ourselves with pathlib
        if cm.dir_exists(path=path):
            if cm.is_hidden(path) and not cm.allow_hidden:
                print('Refusing to serve hidden directory, via 404 Error')
                return

            breadcrumbs = self.generate_breadcrumbs(path)
            page_title = self.generate_page_title(path)
            contents = cm.get(path)

            contents['content'] = sorted(
                contents['content'], key=lambda i: i['name']
            )
            contents['content'] = list(
                filter(self.allowed_content, contents['content'])
            )

            yield (Path('tree') / relative_path / 'index.html', StringIO(self.template.render(
                contents=contents,
                page_title=page_title,
                breadcrumbs=breadcrumbs,
                **self.resources,
            )))

            for file in contents['content']:
                if file['type'] == 'notebook':
                    notebook_path = Path(file['path'].replace('.ipynb', '.html')).relative_to(relative_to)

                    # TODO Find nbformat version in the Notebook content instead of assuming 4
                    with open(nb_path) as f:
                        nb = nbformat.read(f, 4)
                        nb_src = [
                            {
                                'cell_source': cell['source'],
                                'cell_type': cell['cell_type'],
                            }
                            for cell in nb['cells']
                        ]

                    voici_exporter = VoiciExporter(
                        voici_config=self.voici_configuration,
                        # page_config=page_config,
                        base_url=self.base_url,
                        nb_src=nb_src,
                    )

                    yield (notebook_path, StringIO(
                        voici_exporter.from_filename(nb_path)[0]
                    ))
                elif file['type'] == 'directory':
                    for subcontent in self.generate_contents(file['path'], relative_to):
                        yield subcontent

    def init_resources(self, **kwargs) -> Dict:
        resources = {
            'base_url': self.base_url,
            'page_config': self.page_config,
            'frontend': 'voici',
            'main_js': 'voici.js',
            'voila_process': r'(cell_index, cell_count) => {}',
            'voila_finish': r'() => {}',
            'theme': self.theme,
            'include_css': lambda x: '',
            'include_js': lambda x: '',
            'include_url': lambda x: '',
            'include_lab_theme': lambda x: '',
            **kwargs,
        }

        if self.page_config.get('labThemeName') in [
            'JupyterLab Light',
            'JupyterLab Dark',
        ]:
            include_assets_functions = create_include_assets_functions(
                self.template_name, self.base_url
            )
            resources.update(include_assets_functions)

        return resources
