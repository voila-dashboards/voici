#############################################################################
# Copyright (c) 2022, Voilà Contributors                                    #
# Copyright (c) 2022, QuantStack                                            #
#                                                                           #
# Distributed under the terms of the BSD 3-Clause License.                  #
#                                                                           #
# The full license is in the file LICENSE, distributed with this software.  #
#############################################################################


from copy import deepcopy
from functools import partial
from voila.utils import include_lab_theme
from jupyter_server.services.contents.largefilemanager import LargeFileManager

from nbconvert.exporters.templateexporter import TemplateExporter
from nbconvert.filters.highlight import Highlight2HTML
from nbconvert.preprocessors.clearoutput import ClearOutputPreprocessor

from traitlets import default

from voila.exporter import VoilaExporter
from voila.paths import collect_template_paths


class VoiciExporter(VoilaExporter):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("contents_manager", LargeFileManager())

        self.voici_configuration = kwargs.pop("voici_config")
        self.page_config = kwargs.pop("page_config", {})
        self.theme = self.voici_configuration.theme
        self.template_name = self.voici_configuration.template

        super().__init__(*args, **kwargs)

        if self.voici_configuration.strip_sources:
            self.exclude_input = True
            self.exclude_output_prompt = True
            self.exclude_input_prompt = True

    @default("template_paths")
    def _template_paths(self, prune=True, root_dirs=None):
        path = collect_template_paths(
            ["voila", "nbconvert"], self.template_name, prune=True
        )
        return path

    def from_notebook_node(self, nb, resources=None, **kwargs):
        # this replaces from_notebook_node, but calls template.generate instead of template.render
        # Mocking the highligh_code filter

        langinfo = nb.metadata.get("language_info", {})
        lexer = langinfo.get("pygments_lexer", langinfo.get("name", None))
        highlight_code = self.filters.get(
            "highlight_code", Highlight2HTML(pygments_lexer=lexer, parent=self)
        )
        self.register_filter("highlight_code", highlight_code)

        # TODO: This part is already copied three times across
        # nbconvert and Voila, we should do something about it
        nb_copy, resources = super(TemplateExporter, self).from_notebook_node(
            nb, resources, **kwargs
        )

        resources.setdefault("raw_mimetypes", self.raw_mimetypes)
        resources["global_content_filter"] = {
            "include_code": not self.exclude_code_cell,
            "include_markdown": not self.exclude_markdown,
            "include_raw": not self.exclude_raw,
            "include_unknown": not self.exclude_unknown,
            "include_input": not self.exclude_input,
            "include_output": not self.exclude_output,
            "include_input_prompt": not self.exclude_input_prompt,
            "include_output_prompt": not self.exclude_output_prompt,
            "no_prompt": self.exclude_input_prompt and self.exclude_output_prompt,
        }

        def notebook_execute(nb, kernel_id):
            return ""

        page_config = self.update_page_config(nb, resources, self.page_config)

        # align the base url with the one used in the resources
        # this is because the base Voila template expects the base_url to be in the resources here:
        # https://github.com/voila-dashboards/voila/blob/0f4cc5360ff387eeaf7e647cee712b2ce08d573a/share/jupyter/voila/templates/lab/index.html.j2#L81
        # TODO: investigate whether there is something to do in Voila to avoid this
        base_url = page_config["baseUrl"]
        resources["base_url"] = base_url
        html = []
        for html_snippet in self.template.generate(
            nb=nb_copy,
            resources=resources,
            frontend="voici",
            main_js="voici.js",
            voila_process=r"(cell_index, cell_count) => {}",
            voila_finish=r"() => {}",
            kernel_start=self.kernel_start,
            cell_generator=self.cell_generator,
            notebook_execute=notebook_execute,
            static_url=self.static_url,
            base_url=base_url,
            page_config=page_config,
        ):
            html.append(html_snippet)

        return "".join(html), resources

    def kernel_start(self, nb):
        return ""

    def cell_generator(self, nb, kernel_id):
        nb, _ = ClearOutputPreprocessor().preprocess(nb, {})
        for cell_idx, input_cell in enumerate(nb.cells):
            output = input_cell.copy()
            yield output

    def _init_resources(self, resources):
        # Not calling Voila's _init_resources, because we want to embed static
        # assets like CSS and theming instead of serving them from the server
        new_resources = super(VoilaExporter, self)._init_resources(resources)
        new_resources["include_lab_theme"] = partial(include_lab_theme, self.base_url)
        return new_resources

    def update_page_config(self, nb, resources, page_config):
        page_config_copy = deepcopy(page_config)

        page_config_copy["notebookSrc"] = nb

        # We need to forward some Jinja configuration options to the frontend rendering logic
        page_config_copy["include_output"] = resources["global_content_filter"][
            "include_output"
        ]
        page_config_copy["include_output_prompt"] = resources["global_content_filter"][
            "include_output_prompt"
        ]

        return page_config_copy
