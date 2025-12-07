"use client";

import { useState } from "react";
import { BsGearFill } from "react-icons/bs";

type SettingsButtonProp = {
  children: React.ReactElement;
};
export default function SettingsButton({ children }: SettingsButtonProp) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <BsGearFill
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          padding: "1rem",
          width: "auto",
          height: "auto",
          zIndex: 1000,
        }}
        onClick={() => setShowSettings(!showSettings)}
      />
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 40,
            right: 10,
            border: "solid black 1px",
            padding: "1rem",
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}
