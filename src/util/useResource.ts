import { useEffect, useState } from "react";

export default function useJsonResource<T>(path: string) {
  const [resource, setResource] = useState<T>();
  useEffect(() => {
    (async () => {
      const url = "/list-of-paths.json";
      const response = await fetch(url);
      const json = await response.json();
      setResource(json);
    })();
  }, []);
  return resource;
}
