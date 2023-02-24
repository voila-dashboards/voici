import gettext
import os
import io
import json
import shutil
from pathlib import Path

import jinja2

from traitlets.config.application import Application

import nbformat

from jupyter_server.config_manager import recursive_update

from voila.configuration import VoilaConfiguration
from voila.paths import ROOT, collect_static_paths, collect_template_paths

from jupyterlite.addons.base import BaseAddon

from .exporter import VoiciExporter
from .tree_exporter import VoiciTreeExporter


class VoiciAddon(BaseAddon):
    """The Voici JupyterLite app"""

    __all__ = ["post_build"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.voici_configuration = VoilaConfiguration(parent=self)
        self.setup_template_dirs()

        self.base_url = '/'

    @property
    def output_files_dir(self):
        return self.manager.output_dir / "files"

    @property
    def voici_static_path(self):
        return Path(__file__).resolve().parent / 'static'

    def setup_template_dirs(self):
        template_name = self.voici_configuration.template
        self.template_paths = collect_template_paths(
            ['voila', 'nbconvert'], template_name, prune=True
        )
        self.static_paths = collect_static_paths(
            ['voila', 'nbconvert'], template_name
        )
        conf_paths = [
            os.path.join(d, 'conf.json') for d in self.template_paths
        ]

        for p in conf_paths:
            # see if config file exists
            if os.path.exists(p):
                # load the template-related config
                with open(p) as json_file:
                    conf = json.load(json_file)
                # update the overall config with it, preserving CLI config priority
                if 'traitlet_configuration' in conf:
                    recursive_update(
                        conf['traitlet_configuration'],
                        self.voici_configuration.config.VoilaConfiguration,
                    )
                    # pass merged config to overall Voilà config
                    self.voici_configuration.config.VoilaConfiguration = Config(
                        conf['traitlet_configuration']
                    )

        self.jinja2_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(self.template_paths),
            extensions=['jinja2.ext.i18n'],
            **{'autoescape': True},
        )
        nbui = gettext.translation(
            'nbui', localedir=os.path.join(ROOT, 'i18n'), fallback=True
        )
        self.jinja2_env.install_gettext_translations(nbui, newstyle=False)

    def post_build(self, manager):
        """copies the Voici application files to the JupyterLite output and generate static dashboards."""

        # Do nothing if Voici is disabled
        if self.manager.apps and "voici" not in self.manager.apps:
            return

        # TODO Setup page_config (how do we get the page_config from jupyterlite?)

        # Copy static files
        yield dict(
            name=f"voici:copy:{self.voici_static_path}",
            actions=[(self.copy_one, [
                self.voici_static_path,
                self.manager.output_dir / 'voila' / 'static'
            ])],
        )

        # Convert Notebooks content into static dashboards
        tree_exporter = VoiciTreeExporter(
            jinja2_env=self.jinja2_env,
            voici_configuration=self.voici_configuration,
            base_url=self.base_url,
            # page_config=page_config,
        )

        for file_path, generated_file in tree_exporter.generate_contents(str(self.output_files_dir)):
            yield dict(
                name=f"voici:generate:{file_path}",
                actions=[(self.create_one, [
                    generated_file,
                    self.manager.output_dir / 'voila' / file_path
                ])],
            )

    def create_one(self, stringio: io.StringIO, dest: Path):
        """create a file in the lite output"""
        if dest.is_dir():
            shutil.rmtree(dest)
        elif dest.exists():
            dest.unlink()

        if not dest.parent.exists():
            self.log.debug(f"creating folder {dest.parent}")
            dest.parent.mkdir(parents=True)

        self.maybe_timestamp(dest.parent)

        with open(dest, "w") as fobj:
            stringio.seek(0)
            shutil.copyfileobj(stringio, fobj)

        self.maybe_timestamp(dest)
