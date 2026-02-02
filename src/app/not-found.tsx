"use client";

import useJsonResource from "@/util/useResource";
import { usePathname } from "next/navigation";
import { Tooltip } from "react-tooltip";
import UrlRedirect from "./url/redirect";

type PathObject = {
  name: string;
  path?: string;
  children: PathObject[];
};

type FormattedPath = {
  name: string;
  path?: string;
  prefix: string;
};

function getFormattedPath(
  pathObject: PathObject,
  prefix: string = "",
  last: boolean = false
): FormattedPath[] {
  const formattedPaths: FormattedPath[] = [
    {
      name: pathObject.name,
      path: pathObject.path,
      prefix: prefix + (last ? "└─ " : "├─ "),
    },
  ];

  for (let i = 0; i < pathObject.children.length - 1; ++i) {
    const child = pathObject.children[i];
    formattedPaths.push(
      ...getFormattedPath(child, prefix + (last ? "   " : "│  "), false)
    );
  }
  if (pathObject.children.length > 0) {
    const child = pathObject.children[pathObject.children.length - 1];
    formattedPaths.push(
      ...getFormattedPath(child, prefix + (last ? "   " : "│  "), true)
    );
  }

  return formattedPaths;
}

function GlobalNotFound() {
  const paths = useJsonResource<PathObject>("/list-of-paths.json");

  if (paths && window) {
    paths.name = window.location.host;
  }
  const formattedPaths = paths ? getFormattedPath(paths) : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      The page you are looking for does not exist, heres a list of all the pages
      <div style={{ marginTop: 10 }}>
        {formattedPaths?.map((path, i) => {
          const fullpath = window.location.host + "/" + path.path;
          return (
            <div key={i}>
              <pre>
                {path.prefix}
                {path.path ? (
                  <a
                    href={path.path}
                    data-tooltip-id="path"
                    data-tooltip-content={fullpath}
                  >
                    {path.name}
                  </a>
                ) : (
                  <a>{path.name}</a>
                )}
              </pre>
            </div>
          );
        })}
        <Tooltip id="path" />
      </div>
    </div>
  );
}

export default function NotFound() {
  const url = usePathname();
  console.log(url);

  if (url.startsWith("/url/")) {
    return <UrlRedirect />;
  } else {
    return <GlobalNotFound />;
  }
}
