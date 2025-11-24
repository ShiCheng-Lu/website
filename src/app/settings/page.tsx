"use client";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default function Settings() {
  const [cookie, setCookie] = useCookies(["brainRotOff", "adOff"]);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => setInitialized(true), []);

  const expires = new Date();
  expires.setDate(expires.getDate() + 1); // expires in a day

  return (
    initialized && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          gap: "1rem",
        }}
      >
        <div
          onClick={() =>
            setCookie("brainRotOff", !cookie.brainRotOff, { expires })
          }
          style={{ marginRight: "auto" }}
        >
          <input
            type="checkbox"
            checked={cookie.brainRotOff || false}
            readOnly
          />
          <label htmlFor="brainrot">DO NOT SHOW BRAINROT</label>
        </div>
        <div
          onClick={() => setCookie("adOff", !cookie.adOff, { expires })}
          style={{ marginRight: "auto" }}
        >
          <input type="checkbox" checked={cookie.adOff || false} readOnly />
          <label htmlFor="brainrot">DO NOT SHOW AD</label>
        </div>
      </div>
    )
  );
}
