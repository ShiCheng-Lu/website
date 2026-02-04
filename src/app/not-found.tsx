"use client";

import useJsonResource from "@/util/useResource";
import { usePathname } from "next/navigation";
import { Tooltip } from "react-tooltip";
import UrlRedirect from "./url/redirect";
import { stringDiff, stringDiffWithin } from "@/util/diff";

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

function getSimilarPaths(
  url: string,
  pathObject: PathObject
): {
  path: string;
  cost: number;
}[] {
  const paths: { path: string; cost: number }[] = [];
  const workingPaths = [pathObject];
  while (true) {
    const path = workingPaths.pop();
    if (path) {
      if (path.path) {
        paths.push({
          path: "/" + path.path,
          cost: stringDiffWithin("/" + path.path, url),
        });
      }
      workingPaths.push(...path.children);
    } else {
      break;
    }
  }

  paths.sort((a, b) => a.cost - b.cost);
  return paths;
}

function GlobalNotFound() {
  const paths = useJsonResource<PathObject>("/list-of-paths.json");
  const url = usePathname();

  if (paths && window) {
    paths.name = window.location.host;
  }
  const formattedPaths = paths ? getFormattedPath(paths) : undefined;
  const similarPaths = paths ? getSimilarPaths(url, paths) : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>404 Ruh-Roh</h1>
      <p>
        Unfortunately, you're too ahead of your time, and the path you typed in
        does not exist yet.
      </p>
      <p>Here is a list of paths similar to {url}</p>
      <div style={{ margin: 10 }}>
        {similarPaths?.map((path, index) => {
          return (
            (path.cost < 3 || index < 3) && (
              <div key={index}>
                <a href={path.path}>{path.path}</a>
              </div>
            )
          );
        })}
      </div>
      Here is a list all the pages
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
