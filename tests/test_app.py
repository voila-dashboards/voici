import os
from pathlib import Path
from shutil import rmtree
from voici.app import VoiciApp, VoiciBuildApp
import sys
import pytest
from contextlib import contextmanager

CWD = Path.cwd() / "tests/notebooks"


@pytest.fixture(autouse=True)
def change_test_dir(request, monkeypatch):
    monkeypatch.chdir(Path(request.fspath.dirname) / "notebooks")


@pytest.fixture()
def voici_app(tmp_path):
    current_argv = sys.argv
    os.environ.setdefault("JUPYTERLITE_OUTPUT_DIR", str(tmp_path))

    @contextmanager
    def _app(argv):
        setattr(sys, "argv", argv)
        app: VoiciApp = VoiciApp.instance()
        app.initialize()
        yield app
        app.clear_instance()
        app.subapp.clear_instance()
        if tmp_path.exists():
            rmtree(tmp_path)
        return

    yield _app
    os.environ.setdefault("JUPYTERLITE_OUTPUT_DIR", None)
    setattr(sys, "argv", current_argv)


@pytest.mark.parametrize(
    "argv, expected",
    [
        (["voici", "build", "--contents", "."], [CWD]),
        (["voici", "build", "--contents", "foo.ipynb"], [CWD / "foo.ipynb"]),
        (["voici", "bar.ipynb"], [CWD / "files", CWD / "bar.ipynb"]),
        (["voici", "."], [CWD / "files", CWD]),
        # Test incorrect syntaxes
        (["voici", "build", "."], [CWD / "files"]),
        (["voici", "build", "foo.ipynb"], [CWD / "files"]),
    ],
)
def test_initialize(argv, voici_app, expected):
    with voici_app(argv) as app:
        subapp = app.subapp
        assert isinstance(subapp, VoiciBuildApp)
        assert expected == list(subapp.contents)


@pytest.mark.parametrize(
    "argv, notebooks, static_file",
    [
        (
            ["voici", "build", "--contents", f"{CWD / 'voici.ipynb' }"],
            ["voici.ipynb"],
            False,
        ),
        (
            ["voici", "build", "--contents", f"{CWD}"],
            ["foo.ipynb", "voici.ipynb"],
            False,
        ),
        (["voici", f"{CWD / 'foo.ipynb'}"], ["foo.ipynb"], True),
        (["voici", f"{CWD}"], ["foo.ipynb", "voici.ipynb"], True),
    ],
)
def test_start(argv, voici_app, notebooks, static_file):
    with voici_app(argv) as app:
        with pytest.raises(SystemExit) as info:
            app.start()
        assert info.value.code == 0
        out_dir = Path(os.environ.get("JUPYTERLITE_OUTPUT_DIR"))
        assert (out_dir / "voici").exists()
        assert (out_dir / "files/bar.txt").exists() == static_file
        for file in notebooks:
            assert (out_dir / f"files/{file}").exists()
