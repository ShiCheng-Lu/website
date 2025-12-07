"use client";

import CookieClicker from "@/app/games/cookie-clicker/CookieClicker";
import styles from "./page.module.css";
import BackButton from "@/components/BackButton";

export default function CookieClickerPage() {
  return (
    <div className={styles.CookieClickerPage}>
      <BackButton />
      <CookieClicker leaderboard_count={10} />
    </div>
  );
}
