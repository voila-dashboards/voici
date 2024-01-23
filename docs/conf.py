import os

# Add dev disclaimer.
_release = {}
exec(
    compile(
        open("../python/voici/voici/_version.py").read(),
        "../python/voici/voici/_version.py",
        "exec",
    ),
    _release,
)

on_rtd = os.environ.get("READTHEDOCS", None) == "True"

html_theme = "pydata_sphinx_theme"
html_theme_options = dict(github_url="https://github.com/voila-dashboards/voici")

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.intersphinx",
    "sphinx.ext.napoleon",
    "sphinxcontrib.video",
    "myst_parser",
]

source_suffix = ".md"
master_doc = "index"
project = "voici"
copyright = "2020, The Voilà Development Team"
author = "The Voilà Development Team"
version = _release["__version__"]
release = _release["__version__"]
language = "en"

html_logo = "voici-logo.svg"

exclude_patterns = []
highlight_language = "python"
pygments_style = "sphinx"
todo_include_todos = False
htmlhelp_basename = "voicidoc"

intersphinx_mapping = {"https://docs.python.org/": None}
