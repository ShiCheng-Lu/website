"use client";

import Link from "next/link";
import styles from "./page.module.css";
import BackButton from "@/components/BackButton";

export default function Games() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BackButton link={"/"} />
      <div
        style={{
          marginTop: 40,
          width: "max(400px, 50%)",
          alignItems: "center",
          justifyContent: "space-between",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: "20px",
          padding: "20px",
        }}
      >
        <Link className={styles.GameNav} href="/games/cookie-clicker">
          Cookie clicker
        </Link>
        <Link className={styles.GameNav} href="/games/pet">
          Pet
        </Link>
        <Link className={styles.GameNav} href="/games/archery">
          Archery
        </Link>
        <Link className={styles.GameNav} href="/games/noise">
          Noise
        </Link>
      </div>
    </div>
  );
}
