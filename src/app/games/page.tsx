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
      <BackButton />
      <Link className={styles.GameNav} href="/games/cookie-clicker">
        Cookie clicker
      </Link>
      <Link className={styles.GameNav} href="/games/pet">
        Pet
      </Link>
      <Link className={styles.GameNav} href="/games/archery">
        Archery
      </Link>
    </div>
  );
}
