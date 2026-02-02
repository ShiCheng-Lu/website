
from pathlib import Path
import json

def list_paths(path: Path, root: Path):
    '''
    return the paths of the website, a path is a directory with a page.tsx file
    format:
    {
      name: "",
      path: "/",
      children: [
        {
          name: "page",
          path: "/page",
          children: [
            {
              name: "subpage",
              path: "/page/subpage",
              children: []
            }
          ]
        },
        {
          name: "page2",
          path: "/page2",
          children: []
        }
      ]
    }
    '''
    hasPage = False
    children = []
    for entry in path.iterdir():
        if entry.is_dir():
            child = list_paths(entry, root)
            if child != None:
                children.append(child)
        elif entry.name == "page.tsx":
            hasPage = True
    if len(children) > 0 or hasPage:
        pathString = str(path.relative_to(root)).replace('\\', '/')
        return {
            "name": path.name,
            "path": pathString if hasPage else None,
            "children": children
        }
    else:
        return None


if __name__ == "__main__":
    pages = list_paths(Path("src/app"), Path("src/app"))
    print(json.dumps(pages))
else:
    print(__name__)