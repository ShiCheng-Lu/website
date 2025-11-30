import { useEffect, useState } from "react";

export function useDebounce(
  func: (value: any) => void,
  value: any,
  delay = 300
) {
  useEffect(() => {
    const handler = setTimeout(() => func(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
}
