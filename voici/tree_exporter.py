from io import StringIO
from typing import Dict, List, Tuple
from pathlib import Path

import jinja2

from copy import deepcopy
from jupyter_server.utils import url_path_join, url_escape

from nbconvert.exporters import HTMLExporter

from voila.configuration import VoilaConfiguration

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
        content = sorted(content, key=lambda i: i["name"])

        return dict(
            type="directory",
            name=path.stem,
            path=str(path.relative_to(relative_to)),
            content=content,
        )
    if path.is_file() and path.suffix == ".ipynb":
        return dict(
            type="notebook",
            name=path.name,
            path=str(path.relative_to(relative_to)).replace(".ipynb", ".html"),
        )
    return None


def patch_page_config(page_config: Dict, relative_path: Path):
    page_config_copy = deepcopy(page_config)

    # Align the base url with the relative path
    page_config_copy["baseUrl"] = "../../" + "../" * len(relative_path.parts)

    # Grabbing from the Voici static folder
    page_config_copy["fullStaticUrl"] = f"../{'../' * len(relative_path.parts)}build"

    # Grabbing from the jupyterlite static folders
    page_config_copy[
        "settingsUrl"
    ] = f"../../{'../' * len(relative_path.parts)}build/schemas"
    page_config_copy[
        "fullLabextensionsUrl"
    ] = f"../../{'../' * len(relative_path.parts)}extensions"

    # The Themes URL will be joined with the base URL in the
    # JupyterLite main application
    page_config_copy["themesUrl"] = "./build/themes"

    return page_config_copy


class VoiciTreeExporter(HTMLExporter):
    def __init__(
        self,
        jinja2_env: jinja2.Environment,
        voici_configuration: VoilaConfiguration,
        **kwargs,
    ):
        self.jinja2_env = jinja2_env
        self.voici_configuration = voici_configuration

        self.theme = voici_configuration.theme
        self.template_name = voici_configuration.template

        self.notebook_paths = []

        self.resources = self._init_resources({})

    def allowed_content(self, content: Dict) -> bool:
        return content["type"] == "notebook" or content["type"] == "directory"

    def generate_breadcrumbs(self, path: Path, depth: int) -> List:
        root = "../../" + "../" * depth
        breadcrumbs = [(url_path_join(root, "voici/tree"), "")]
        parts = path.parts

        for i in range(len(parts)):
            if parts[i]:
                link = url_path_join(
                    root,
                    "voici/tree",
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
            return page_title + "/"
        else:
            return "Voici Home"

    def will_render_tree(
        self, template, contents, page_title, breadcrumbs, relative_path
    ):
        """Return a function that will render the tree into a StringIO and return it."""

        def render_tree(page_config) -> StringIO:
            page_config = patch_page_config(page_config, relative_path)

            return StringIO(
                template.render(
                    frontend="voici",
                    contents=contents,
                    page_title=page_title,
                    breadcrumbs=breadcrumbs,
                    page_config=page_config,
                    base_url=page_config["baseUrl"],
                    **self.resources,
                )
            )

        return render_tree

    def will_render_notebook(self, notebook_path, relative_path):
        """Return a function that will render the notebook into a StringIO and return it."""

        def render_notebook(page_config) -> StringIO:
            page_config = patch_page_config(page_config, relative_path)

            voici_exporter = VoiciExporter(
                voici_config=self.voici_configuration,
                page_config=page_config,
                base_url=page_config["baseUrl"],
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
            relative_path = Path(".")
            breadcrumbs = []
        else:
            relative_path = path.relative_to(relative_to)
            breadcrumbs = self.generate_breadcrumbs(
                relative_path, len(relative_path.parts)
            )

        template = self.jinja2_env.get_template("tree.html")

        page_title = self.generate_page_title(path)

        contents = path_to_content(path, relative_to)

        if contents is None:
            return

        yield (
            Path("tree") / relative_path / "index.html",
            self.will_render_tree(
                template, contents, page_title, breadcrumbs, relative_path
            ),
        )

        for file in contents.get("content", []):
            if file["type"] == "notebook":
                yield (
                    Path("render") / file["path"],
                    self.will_render_notebook(
                        lite_files_output / file["path"].replace(".html", ".ipynb"),
                        relative_path,
                    ),
                )
            elif file["type"] == "directory":
                for subcontent in self.generate_contents(
                    path / file["name"], lite_files_output, relative_to
                ):
                    yield subcontent
