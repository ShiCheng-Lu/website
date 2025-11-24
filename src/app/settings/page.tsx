"use client";

import { useCookies } from "react-cookie";

export default function Settings() {
  const [cookie, setCookie] = useCookies(["brainRotOff", "adOff"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "2rem", gap: "1rem" }}>
      <div>
        <input
          type="checkbox"
          onChange={(e) => {
            setCookie("brainRotOff", e.target.checked);
          }}
          checked={cookie["brainRotOff"] || false}
        />
        <label htmlFor="brainrot">DO NOT SHOW BRAINROT</label>
      </div>
      <div>
        <input
          type="checkbox"
          onChange={(e) => {
            setCookie("adOff", e.target.checked);
          }}
          checked={cookie["adOff"] || false}
        />
        <label htmlFor="brainrot">DO NOT SHOW AD</label>
      </div>
    </div>
  );
}
