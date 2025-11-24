"use client";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default function Settings() {
  const [cookie, setCookie] = useCookies([
    "disableBrainRot",
    "disableAd",
    "disable8Ball",
  ]);
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
            setCookie("disableBrainRot", !cookie.disableBrainRot, { expires })
          }
          style={{ marginRight: "auto" }}
        >
          <input
            type="checkbox"
            checked={cookie.disableBrainRot || false}
            readOnly
          />
          <label htmlFor="brainrot">DO NOT SHOW BRAINROT</label>
        </div>
        <div
          onClick={() => setCookie("disableAd", !cookie.disableAd, { expires })}
          style={{ marginRight: "auto" }}
        >
          <input type="checkbox" checked={cookie.disableAd || false} readOnly />
          <label htmlFor="brainrot">DO NOT SHOW AD</label>
        </div>
        <div
          onClick={() =>
            setCookie("disable8Ball", !cookie.disable8Ball, { expires })
          }
          style={{ marginRight: "auto" }}
        >
          <input
            type="checkbox"
            checked={cookie.disable8Ball || false}
            readOnly
          />
          <label htmlFor="brainrot">DO NOT MAGIC 8 BALL</label>
        </div>
      </div>
    )
  );
}
