import gettext
import os
import json
from pathlib import Path

import jinja2

from traitlets.config.application import Application

from jupyter_server.config_manager import recursive_update

from voila.configuration import VoilaConfiguration
from voila.paths import ROOT, collect_static_paths, collect_template_paths

from jupyterlite.addons.base import BaseAddon


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
        """copies the Voici application files to the JupyterLite output."""

        # Do nothing if Voici is disabled
        # if self.manager.apps and "voici" not in self.manager.apps:
        #     return

        # TODO Setup page_config (how do we get the page_config from jupyterlite?)

        # Copy static files
        yield dict(
            name=f"voici:copy:{self.voici_static_path}",
            actions=[(self.copy_one, [
                self.voici_static_path,
                self.manager.output_dir / 'voici' / 'static'
            ])],
        )
