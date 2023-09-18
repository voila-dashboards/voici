import gettext
import os
import io
import json
import shutil
from pathlib import Path
from typing import Callable, Dict

import jinja2

from traitlets.config import Config

from jupyter_server.config_manager import recursive_update

from voila.configuration import VoilaConfiguration
from voila.paths import ROOT, collect_static_paths, collect_template_paths

from jupyterlite_core.addons.base import BaseAddon
from jupyterlite_core.constants import (
    JSON_FMT,
    JUPYTER_CONFIG_DATA,
    JUPYTERLITE_JSON,
    UTF8,
)

from .tree_exporter import VoiciTreeExporter


class VoiciAddon(BaseAddon):
    """The Voici JupyterLite app"""

    __all__ = ["post_build"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.voici_configuration = VoilaConfiguration(parent=self)
        self.setup_template_dirs()

    @property
    def output_files_dir(self):
        return self.manager.output_dir / "files"

    @property
    def voici_static_path(self):
        return Path(__file__).resolve().parent / "static"

    def setup_template_dirs(self):
        template_name = self.voici_configuration.template
        self.template_paths = collect_template_paths(
            ["voila", "nbconvert"], template_name, prune=True
        )
        self.static_paths = collect_static_paths(["voila", "nbconvert"], template_name)
        conf_paths = [os.path.join(d, "conf.json") for d in self.template_paths]

        for p in conf_paths:
            # see if config file exists
            if os.path.exists(p):
                # load the template-related config
                with open(p) as json_file:
                    conf = json.load(json_file)
                # update the overall config with it, preserving CLI config priority
                if "traitlet_configuration" in conf:
                    recursive_update(
                        conf["traitlet_configuration"],
                        self.voici_configuration.config.VoilaConfiguration,
                    )
                    # pass merged config to overall Voilà config
                    self.voici_configuration.config.VoilaConfiguration = Config(
                        conf["traitlet_configuration"]
                    )

        self.jinja2_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(self.template_paths),
            extensions=["jinja2.ext.i18n"],
            **{"autoescape": True},
        )
        nbui = gettext.translation(
            "nbui", localedir=os.path.join(ROOT, "i18n"), fallback=True
        )
        self.jinja2_env.install_gettext_translations(nbui, newstyle=False)

    def post_build(self, manager):
        """Copies the Voici application files to the JupyterLite output
        and generate static dashboards."""

        # Do nothing if Voici is disabled
        if not self.manager.apps or (
            self.manager.apps and "voici" not in self.manager.apps
        ):
            return

        # Patch the main jupyter-lite.json
        yield dict(
            name=f"voici:patch:{JUPYTERLITE_JSON}",
            actions=[
                (
                    self.patch_main_jupyterlite_json,
                    [],
                )
            ],
        )

        # Copy static assets
        yield dict(
            name=f"voici:copy:{self.voici_static_path}",
            actions=[
                (
                    self.copy_one,
                    [self.voici_static_path, self.manager.output_dir / "voici"],
                )
            ],
        )

        # Convert Notebooks content into static dashboards
        tree_exporter = VoiciTreeExporter(
            jinja2_env=self.jinja2_env, voici_configuration=self.voici_configuration
        )

        for file_path, generate_file in tree_exporter.generate_contents(
            self.output_files_dir, self.output_files_dir
        ):
            yield dict(
                name=f"voici:generate:{file_path}",
                actions=[
                    (
                        self.create_dashboard_or_tree,
                        [generate_file, self.manager.output_dir / "voici" / file_path],
                    )
                ],
            )

        # Update index page
        yield dict(
            name=f"voici:update_index:{self.manager.output_dir}",
            actions=[
                (
                    self.update_index,
                    [self.manager.output_dir / "voici"],
                )
            ],
        )

    def update_index(self, desc: Path):
        """Update the redirect URL"""

        single_dashboard = False
        file_name = None
        for content in self.manager.contents:
            if content.is_file():
                single_dashboard = True
                file_name = content.stem
                break
        if single_dashboard and file_name is not None:
            new_url = f"/voici/render/{file_name}.html"
        else:
            new_url = "/voici/tree/index.html"
        index_file = desc / "index.html"
        with open(index_file, "r+") as f:
            content = f.read()
            new_content = content.replace(r"{{voici_index_url}}", new_url)
            f.seek(0)
            f.write(new_content)

    def create_dashboard_or_tree(
        self, generate_file: Callable[[Dict], io.StringIO], dest: Path
    ):
        """generate a voici dashboard or tree view in the lite output"""
        # Get page_config
        jupyterlite_json = self.manager.output_dir / JUPYTERLITE_JSON
        config = json.loads(jupyterlite_json.read_text(**UTF8))
        page_config = config.get(JUPYTER_CONFIG_DATA, {})

        # TODO Update Voila templates so we don't need this,
        # the following monkey patch will not work if lite is served
        # in a sub directory
        page_config["baseUrl"] = "/"

        generated_file = generate_file(page_config)

        if dest.is_dir():
            shutil.rmtree(dest)
        elif dest.exists():
            dest.unlink()

        if not dest.parent.exists():
            self.log.debug(f"creating folder {dest.parent}")
            dest.parent.mkdir(parents=True)

        self.maybe_timestamp(dest.parent)

        with open(dest, "w") as fobj:
            generated_file.seek(0)
            shutil.copyfileobj(generated_file, fobj)

        self.maybe_timestamp(dest)

    def patch_main_jupyterlite_json(self):
        # Don't patch anything if Voici is not the only app
        if (
            not self.manager.apps
            or len(self.manager.apps) != 1
            or "voici" not in self.manager.apps
        ):
            return

        jupyterlite_json = self.manager.output_dir / JUPYTERLITE_JSON
        config = json.loads(jupyterlite_json.read_text(**UTF8))
        page_config = config.get(JUPYTER_CONFIG_DATA, {})

        # Patch appUrl
        page_config["appUrl"] = "./voici"

        # Path favicon
        page_config["faviconUrl"] = "./voici/favicon.ico"

        config[JUPYTER_CONFIG_DATA] = page_config

        jupyterlite_json.write_text(json.dumps(config, **JSON_FMT), **UTF8)
