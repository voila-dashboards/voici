from io import StringIO
from typing import Dict, List, Tuple
from pathlib import Path

import jinja2

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


class VoiciTreeExporter(HTMLExporter):
    def __init__(
        self,
        jinja2_env: jinja2.Environment,
        voici_configuration: VoilaConfiguration,
        base_url: str,
        page_config: Dict,
        **kwargs,
    ):
        self.jinja2_env = jinja2_env
        self.voici_configuration = voici_configuration
        self.base_url = base_url
        self.page_config = page_config

        self.theme = voici_configuration.theme
        self.template_name = voici_configuration.template

        self.notebook_paths = []

    def allowed_content(self, content: Dict) -> bool:
        return content["type"] == "notebook" or content["type"] == "directory"

    def generate_breadcrumbs(self, path: Path) -> List:
        breadcrumbs = [(url_path_join(self.base_url, "voila/tree"), "")]
        parts = path.parts
        for i in range(len(parts)):
            if parts[i]:
                link = url_path_join(
                    self.base_url,
                    "voila/tree",
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

    def generate_contents(self, path: Path, relative_to=None) -> Tuple[Dict, List[str]]:
        """Generate the Tree content. This is a generator method that generates tuples (filepath, file)."""
        if relative_to is None:
            relative_to = path
            relative_path = Path(".")
            breadcrumbs = []
        else:
            relative_path = path.relative_to(relative_to)
            breadcrumbs = self.generate_breadcrumbs(relative_path)

        resources = self._init_resources({})
        template = self.jinja2_env.get_template("tree.html")

        page_title = self.generate_page_title(path)

        contents = path_to_content(path, relative_to)

        yield (
            Path("tree") / relative_path / "index.html",
            StringIO(
                template.render(
                    contents=contents,
                    page_title=page_title,
                    breadcrumbs=breadcrumbs,
                    page_config=self.page_config,
                    base_url=self.base_url,
                    **resources,
                )
            ),
        )

        for file in contents["content"]:
            if file["type"] == "notebook":
                voici_exporter = VoiciExporter(
                    voici_config=self.voici_configuration,
                    page_config=self.page_config,
                    base_url=self.base_url,
                )

                yield (
                    Path("render") / file["path"],
                    StringIO(voici_exporter.from_filename(file["path"].replace(".html", ".ipynb"))[0]),
                )
            elif file["type"] == "directory":
                for subcontent in self.generate_contents(
                    path / file["name"], relative_to
                ):
                    yield subcontent
