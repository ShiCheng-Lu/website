import Link from "next/link";
import styles from "./page.module.css";

export default function Games() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link className={styles.GameNav} href="/games/cookie-clicker">
        Cookie clicker
      </Link>
      <Link className={styles.GameNav} href="/games/pet">
        Pet
      </Link>
      {/* <Link className={styles.GameNav} href="/games/archery">
        Archery
      </Link> */}
    </div>
  );
}
