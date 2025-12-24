#############################################################################
# Copyright (c) 2022, Voilà Contributors                                    #
# Copyright (c) 2022, QuantStack                                            #
#                                                                           #
# Distributed under the terms of the BSD 3-Clause License.                  #
#                                                                           #
# The full license is in the file LICENSE, distributed with this software.  #
#############################################################################


import posixpath
import re
from copy import deepcopy
from functools import partial
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from voila.utils import include_lab_theme
from jupyter_server.services.contents.largefilemanager import LargeFileManager

from nbconvert.exporters.templateexporter import TemplateExporter
from nbconvert.filters.highlight import Highlight2HTML
from nbconvert.filters.markdown_mistune import MarkdownWithMath
from nbconvert.preprocessors.clearoutput import ClearOutputPreprocessor

import traitlets
from traitlets import default
from traitlets.config import Config

from voila.exporter import VoilaExporter, VoilaMarkdownRenderer, pass_context
from voila.paths import collect_template_paths


class VoiciMarkdownRenderer(VoilaMarkdownRenderer):
    """Custom markdown renderer"""

    # Pattern to match .ipynb extension, optionally followed by anchor or query string
    IPYNB_PATTERN = re.compile(r'\.ipynb(#.*)?(\?.*)?$')

    def __init__(self, *args, files_url_prefix: str = '', **kwargs):
        """Initialize the renderer.

        Args:
            files_url_prefix: The URL prefix to prepend to relative non-notebook URLs
                              to make them point to the files/ directory.
                              e.g., '../../files/' for a notebook at the root level.
        """
        super().__init__(*args, **kwargs)
        self.files_url_prefix = files_url_prefix

    def _normalize_relative_path(self, path: str) -> Optional[str]:
        """Normalize a relative path, returning None if it would escape the directory.

        Args:
            path: The relative path to normalize (URL-style with forward slashes)

        Returns:
            The normalized path, or None if it escapes the directory via '..'.
        """
        normalized = posixpath.normpath(path)
        if normalized == '..' or normalized.startswith('../') or normalized == '.':
            return None
        return normalized

    def link(self, text: str, url: str, title: Optional[str] = None) -> str:
        # Only rewrite relative URLs (not absolute URLs with scheme or protocol-relative)
        parsed = urlparse(url)
        if not parsed.scheme and not parsed.netloc and url and not url.startswith('/'):
            if self.IPYNB_PATTERN.search(url):
                # Rewrite .ipynb links to .html
                url = self.IPYNB_PATTERN.sub(r'.html\1\2', url)
            elif self.files_url_prefix:
                # Rewrite other relative URLs to point to the files/ directory
                normalized = self._normalize_relative_path(url)
                if normalized is not None:
                    url = posixpath.join(self.files_url_prefix, normalized)
        return super().link(text, url, title)

    def image(self, text: str, url: str, title: Optional[str] = None):
        if self.files_url_prefix and not self.contents_manager.file_exists(url):
            parsed = urlparse(url)
            if not parsed.scheme and not parsed.netloc and not url.startswith('/'):
                # Rewrite to files/ directory if path is safe
                normalized = self._normalize_relative_path(url)
                if normalized is not None:
                    url = posixpath.join(self.files_url_prefix, normalized)

        return super().image(text, url, title)


class VoiciExporter(VoilaExporter):
    markdown_renderer_class = traitlets.Type(
        default_value=VoiciMarkdownRenderer,
        klass=VoilaMarkdownRenderer,
        help="Custom markdown renderer that rewrites .ipynb links to .html",
    ).tag(config=True)

    @property
    def default_config(self):
        c = Config(
            {
                "VoiciExporter": {
                    "markdown_renderer_class": "voici_core.exporter.VoiciMarkdownRenderer"
                }
            }
        )
        c.merge(super().default_config)
        return c

    def __init__(self, *args, **kwargs):
        notebook_path = kwargs.pop('notebook_path', None)
        self.files_url_prefix = kwargs.pop('files_url_prefix', '')

        if notebook_path and 'contents_manager' not in kwargs:
            cm = LargeFileManager()
            cm.root_dir = str(Path(notebook_path).parent)
            kwargs['contents_manager'] = cm
        else:
            kwargs.setdefault('contents_manager', LargeFileManager())

        self.voici_configuration = kwargs.pop('voici_config')
        self.page_config = kwargs.pop('page_config', {})
        self.theme = self.voici_configuration.theme
        self.template_name = self.voici_configuration.template

        super().__init__(*args, **kwargs)

        if self.voici_configuration.strip_sources:
            self.exclude_input = True
            self.exclude_output_prompt = True
            self.exclude_input_prompt = True

    @pass_context
    def markdown2html(self, context, source):
        """Override to pass files_url_prefix to the markdown renderer."""
        cell = context["cell"]
        attachments = cell.get("attachments", {})
        cls = self.markdown_renderer_class
        renderer = cls(
            escape=False,
            attachments=attachments,
            contents_manager=self.contents_manager,
            anchor_link_text=self.anchor_link_text,
            files_url_prefix=self.files_url_prefix,
        )
        return MarkdownWithMath(renderer=renderer).render(source)

    @default('template_paths')
    def _template_paths(self, prune=True, root_dirs=None):
        path = collect_template_paths(['voila', 'nbconvert'], self.template_name, prune=True)
        return path

    def from_notebook_node(self, nb, resources=None, **kwargs):
        # this replaces from_notebook_node, but calls template.generate instead of template.render
        # Mocking the highligh_code filter

        langinfo = nb.metadata.get('language_info', {})
        lexer = langinfo.get('pygments_lexer', langinfo.get('name', None))
        highlight_code = self.filters.get(
            'highlight_code', Highlight2HTML(pygments_lexer=lexer, parent=self)
        )
        self.register_filter('highlight_code', highlight_code)

        # TODO: This part is already copied three times across
        # nbconvert and Voila, we should do something about it
        nb_copy, resources = super(TemplateExporter, self).from_notebook_node(
            nb, resources, **kwargs
        )

        resources.setdefault('raw_mimetypes', self.raw_mimetypes)
        resources['global_content_filter'] = {
            'include_code': not self.exclude_code_cell,
            'include_markdown': not self.exclude_markdown,
            'include_raw': not self.exclude_raw,
            'include_unknown': not self.exclude_unknown,
            'include_input': not self.exclude_input,
            'include_output': not self.exclude_output,
            'include_input_prompt': not self.exclude_input_prompt,
            'include_output_prompt': not self.exclude_output_prompt,
            'no_prompt': self.exclude_input_prompt and self.exclude_output_prompt,
        }

        def notebook_execute(nb, kernel_id):
            return ''

        page_config = self.update_page_config(nb, resources, self.page_config)

        # align the base url with the one used in the resources
        # this is because the base Voila template expects the base_url to be in the resources here:
        # https://github.com/voila-dashboards/voila/blob/0f4cc5360ff387eeaf7e647cee712b2ce08d573a/share/jupyter/voila/templates/lab/index.html.j2#L81
        # TODO: investigate whether there is something to do in Voila to avoid this
        base_url = page_config['baseUrl']
        resources['base_url'] = base_url
        html = []
        for html_snippet in self.template.generate(
            nb=nb_copy,
            resources=resources,
            frontend='voici',
            main_js='voici.js',
            voila_process=r'(cell_index, cell_count) => {}',
            voila_finish=r'() => {}',
            kernel_start=self.kernel_start,
            cell_generator=self.cell_generator,
            notebook_execute=notebook_execute,
            static_url=self.static_url,
            base_url=base_url,
            page_config=page_config,
        ):
            html.append(html_snippet)

        return ''.join(html), resources

    def kernel_start(self, nb):
        return ''

    def cell_generator(self, nb, kernel_id):
        nb, _ = ClearOutputPreprocessor().preprocess(nb, {})
        for cell_idx, input_cell in enumerate(nb.cells):
            output = input_cell.copy()
            yield output

    def _init_resources(self, resources):
        # Not calling Voila's _init_resources, because we want to embed static
        # assets like CSS and theming instead of serving them from the server
        new_resources = super(VoilaExporter, self)._init_resources(resources)
        new_resources['include_lab_theme'] = partial(include_lab_theme, self.base_url)
        return new_resources

    def update_page_config(self, nb, resources, page_config):
        page_config_copy = deepcopy(page_config)

        page_config_copy['notebookSrc'] = nb

        # We need to forward some Jinja configuration options to the frontend rendering logic
        page_config_copy['include_output'] = resources['global_content_filter']['include_output']
        page_config_copy['include_output_prompt'] = resources['global_content_filter'][
            'include_output_prompt'
        ]

        return page_config_copy
