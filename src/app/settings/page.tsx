"use client";

import { useCookies } from "react-cookie";

export default function Settings() {
  const [cookie, setCookie] = useCookies(["brainRotOff", "adOff"]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        gap: "1rem",
      }}
    >
      <div
        onClick={() => setCookie("brainRotOff", !cookie.brainRotOff)}
        style={{ marginRight: "auto" }}
      >
        <input
          type="checkbox"
          checked={cookie["brainRotOff"] || false}
          readOnly
        />
        <label htmlFor="brainrot">DO NOT SHOW BRAINROT</label>
      </div>
      <div
        onClick={() => setCookie("adOff", !cookie.adOff)}
        style={{ marginRight: "auto" }}
      >
        <input type="checkbox" checked={cookie["adOff"] || false} readOnly />
        <label htmlFor="brainrot">DO NOT SHOW AD</label>
      </div>
    </div>
  );
}
