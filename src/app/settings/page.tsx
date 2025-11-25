"use client";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default function Settings() {
  const [cookie, setCookie] = useCookies([
    "disableBrainRot",
    "disableAd",
    "disable8Ball",
    "acceptedPolicy",
  ]);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => setInitialized(true), []);

  const expires = (days: number = 1) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return {
      expires: date,
    };
  };

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
            setCookie("disableBrainRot", !cookie.disableBrainRot, expires(1))
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
          onClick={() => setCookie("disableAd", !cookie.disableAd, expires(1))}
          style={{ marginRight: "auto" }}
        >
          <input type="checkbox" checked={cookie.disableAd || false} readOnly />
          <label htmlFor="brainrot">DO NOT SHOW AD</label>
        </div>
        <div
          onClick={() =>
            setCookie("disable8Ball", !cookie.disable8Ball, expires(1))
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
        <div
          onClick={() =>
            setCookie("acceptedPolicy", !cookie.acceptedPolicy, expires(7))
          }
          style={{ marginRight: "auto" }}
        >
          <input
            type="checkbox"
            checked={cookie.acceptedPolicy || false}
            readOnly
          />
          <label htmlFor="acceptedPolicy">ACCEPTED POLICY</label>
        </div>
      </div>
    )
  );
}
