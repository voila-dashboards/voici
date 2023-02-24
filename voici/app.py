import subprocess


def main():
    subprocess.run(
        "jupyter lite build . --apps voici --contents .", shell=True, check=True
    )
