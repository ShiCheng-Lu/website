import json
from pathlib import Path
from list_paths import list_paths


if __name__ == "__main__":
    pages = list_paths(Path("src/app"), Path("src/app"))
    json.dump(pages, Path("public/list-of-paths.json").open("+w"))
