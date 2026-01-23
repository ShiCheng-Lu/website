"use client";

import { useEffect, useMemo, useState } from "react";

export default function PoliticalAndEconomicStateOfTheWorldRightNow() {
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const url = // use local file for local dev, so that we don't ddos wikipedia
        process.env.NODE_ENV === "production"
          ? "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_ongoing_armed_conflicts&formatversion=2&origin=*"
          : "List_of_ongoing_armed_conflicts.json";
      const response = await fetch(url);
      const json = await response.json();
      const text = json.parse.text as string;

      const countries = new Set<string>();
      for (const type of ["conflicts10000", "conflicts1000"]) {
        const table = text.match(
          new RegExp(`<table[^\n]*?id="${type}">(.*?)<\\/table>`, "gs")
        )?.[0];
        if (!table) continue;

        const document = new DOMParser().parseFromString(table, "text/xml");
        for (const row of document.querySelectorAll("tr:not(:first-child)")) {
          for (const country of row.children[3].querySelectorAll("a")) {
            if (country.textContent) {
              countries.add(country.textContent);
            }
          }
        }
      }
      setCountries([...countries]);
    })();
  }, []);

  return (
    <div>
      Naughty list:
      {countries.map((country, index) => {
        return <div key={index}>- {country}</div>;
      })}
    </div>
  );
}
