"use client";

import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { BsChevronLeft } from "react-icons/bs";

export default function Settings() {
  const router = useRouter();

  const [cookie, setCookie] = useCookies([
    "disableBrainRot",
    "disableAd",
    "disable8Ball",
    "acceptedPolicy",
    "useTabs",
  ]);

  const expires = (days: number = 1) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return {
      expires: date,
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "3rem",
        gap: "1rem",
      }}
    >
      <BsChevronLeft
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          padding: "1rem",
          width: "auto",
          height: "auto",
        }}
        onClick={router.back}
      />

      <div
        onClick={() =>
          setCookie("disableBrainRot", !cookie.disableBrainRot, expires(365))
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
        onClick={() => setCookie("disableAd", !cookie.disableAd, expires(365))}
        style={{ marginRight: "auto" }}
      >
        <input type="checkbox" checked={cookie.disableAd || false} readOnly />
        <label htmlFor="brainrot">DO NOT SHOW AD</label>
      </div>
      <div
        onClick={() =>
          setCookie("disable8Ball", !cookie.disable8Ball, expires(365))
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
          setCookie("acceptedPolicy", !cookie.acceptedPolicy, expires(365))
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
      <div
        onClick={() => setCookie("useTabs", !cookie.useTabs, expires(365))}
        style={{ marginRight: "auto" }}
      >
        <input type="checkbox" checked={cookie.useTabs || false} readOnly />
        <label htmlFor="acceptedPolicy">USE TABS</label>
      </div>
    </div>
  );
}
