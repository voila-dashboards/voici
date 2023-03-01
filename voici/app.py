from traitlets import default

from jupyterlite.app import (
    ManagedApp,
    LiteListApp,
    LiteStatusApp,
    LiteInitApp,
    LiteBuildApp,
    LiteCheckApp,
    LiteServeApp,
    LiteArchiveApp,
    PipliteApp,
    LiteApp,
)


class VoiciAppMixin(ManagedApp):
    @default("lite_manager")
    def _default_manager(self):
        manager = super()._default_manager()

        # If "apps" is not user-specified, we build only voici
        if not manager.apps:
            manager.apps = ["voici"]
        # If it is specified, we make sure voici is included
        elif "voici" not in manager.apps:
            manager.apps = list(manager.apps) + ["voici"]

        return manager


class VoiciListApp(LiteListApp, VoiciAppMixin):
    """describe a Voici site"""

    pass


class VoiciStatusApp(LiteStatusApp, VoiciAppMixin):
    """report about what a Voici build _might_ do"""

    pass


class VoiciInitApp(LiteInitApp, VoiciAppMixin):
    """initialize a Voici site from an app archive baseline"""

    pass


class VoiciBuildApp(LiteBuildApp, VoiciAppMixin):
    """build a Voici site, including user content"""

    pass


class VoiciCheckApp(LiteCheckApp, VoiciAppMixin):
    """verify a Voici site, using available schema and rules"""

    pass


class VoiciServeApp(LiteServeApp, VoiciAppMixin):
    """serve a Voici site, using best available HTTP server"""

    pass


class VoiciArchiveApp(LiteArchiveApp, VoiciAppMixin):
    """build a Voici app archive, which can be used as a baseline"""

    pass


class VoiciApp(LiteApp):
    """build ready-to-serve (or -publish) Voici sites"""

    subcommands = {
        k: (v, v.__doc__.splitlines()[0].strip())
        for k, v in dict(
            # special apps
            list=VoiciListApp,
            # task apps
            status=VoiciStatusApp,
            init=VoiciInitApp,
            build=VoiciBuildApp,
            check=VoiciCheckApp,
            serve=VoiciServeApp,
            archive=VoiciArchiveApp,
            pip=PipliteApp,
        ).items()
    }


main = launch_new_instance = VoiciApp.launch_instance

if __name__ == "__main__":  # pragma: nocover
    main()
