import { useEffect, useState } from "react";

class CountriesInConflict {
  conflicts10000: string[] = [];
  conflicts1000: string[] = [];
  conflicts100: string[] = [];
}

export default function useCountriesInConflict(): CountriesInConflict {
  const [countries, setCountries] = useState(new CountriesInConflict());

  useEffect(() => {
    (async () => {
      const url = // use local file for local dev, so that we don't ddos wikipedia
        process.env.NODE_ENV === "production"
          ? "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_ongoing_armed_conflicts&formatversion=2&origin=*"
          : "List_of_ongoing_armed_conflicts.json";
      const response = await fetch(url);
      const json = await response.json();
      const text = json.parse.text as string;
      const countries = new CountriesInConflict();
      const conflicts = Object.keys(countries) as (keyof CountriesInConflict)[];

      for (const type of conflicts) {
        const set = new Set<string>();
        const table = text.match(
          new RegExp(`<table[^\n]*?id="${type}">(.*?)<\\/table>`, "gs")
        )?.[0];
        if (!table) continue;

        const document = new DOMParser().parseFromString(table, "text/xml");
        for (const row of document.querySelectorAll("tr:not(:first-child)")) {
          for (const country of row.children[3].querySelectorAll("a")) {
            if (country.textContent) {
              set.add(country.textContent);
            }
          }
        }
        countries[type] = [...set];
      }
      setCountries(countries);
    })();
  }, []);

  return countries;
}
