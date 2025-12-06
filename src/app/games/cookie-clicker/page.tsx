"use client";

import CookieClicker from "@/app/games/cookie-clicker/CookieClicker";
import styles from "./page.module.css";

export default function CookieClickerPage() {
  return (
    <div className={styles.CookieClickerPage}>
      <CookieClicker leaderboard_count={10} />
    </div>
  );
}
