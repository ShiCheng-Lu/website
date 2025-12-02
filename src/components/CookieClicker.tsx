import { useDebounce } from "@/util/debounce";
import {
  getUser,
  getTopClickers,
  updateDisplayName,
  createUser,
  CookieClickData,
  clickCookie,
} from "@/util/firebase";
import { CSSProperties, useEffect, useRef, useState } from "react";
import styles from "./CookieClicker.module.css";
import React from "react";
import ClickAnimation from "./ClickAnimation";

export default function CookieClicker() {
  const [leaderboard, setLeaderboard] = useState<CookieClickData[]>([]);
  const [user, setUser] = useState({ display_name: "", count: 0, id: "" });
  const [increment, setIncrement] = useState(0);
  const [newName, setNewName] = useState<string>();
  const [pointer, setPointer] = useState(false);
  const [clickHandler, setClickHandler] =
    useState<(x: number, y: number) => void>();

  useEffect(() => {
    const unsub = getTopClickers(setLeaderboard);
    const unsub2 = getUser((user) => {
      if (user) {
        setUser(user);
      } else {
        createUser();
      }
    });
    // return () => {
    //   unsub();
    //   unsub2();
    // };
  }, []);

  const onPointerMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const bound = e.currentTarget!.getBoundingClientRect();
    const dy = e.clientY - (bound.top + bound.bottom) / 2;
    const dx = e.clientX - (bound.left + bound.right) / 2;
    const r = (bound.bottom - bound.top + bound.right - bound.left) / 4;
    const inside = dx * dx + dy * dy < r * r;
    setPointer(inside);
    return inside;
  };

  useDebounce(
    (increment) => {
      if (increment != 0) {
        setIncrement(0);
        clickCookie(increment);
      }
    },
    increment,
    2000
  );

  useDebounce(
    (name) => {
      if (name) {
        updateDisplayName(name);
      }
    },
    newName,
    2000
  );

  const onClick = (e: React.PointerEvent) => {
    // if clicked more than 50 times, force sync so we don't have to wait for debounce to sync, this keeps the leaderboard updated if the user is constantly clicking
    if (increment > 50) {
      clickCookie(increment + 1);
      setIncrement(0);
    } else {
      setIncrement(increment + 1);
    }
    clickHandler?.(e.clientX, e.clientY);
  };

  const place = (index: number) => {
    if (index === 0) {
      return "🥇";
    } else if (index === 1) {
      return "🥈";
    } else if (index === 2) {
      return "🥉";
    } else {
      return "";
    }
  };

  const isUser = (data: CookieClickData) => {
    return data.id === user.id;
  };
  const userIsOnLeaderboard =
    leaderboard.find((row) => row.id === user.id) !== undefined;

  return (
    <div className={styles.CookieClicker}>
      <div className={styles.CookieClickerLeaderboard}>
        <h2>Leaderboard</h2>
        <div
          style={{
            width: "100%",
          }}
        >
          {leaderboard.map((row, index) => {
            return (
              <div
                className={`${styles.CookieClickerLeaderboardRow} ${
                  isUser(row) ? styles.CookieClickerLeaderboardRowUser : ""
                }`}
                key={index}
              >
                <p>
                  {place(index)} {row.display_name}
                </p>
                <p>{row.count + (isUser(row) ? increment : 0)}</p>
              </div>
            );
          })}
          {!userIsOnLeaderboard && (
            <div
              className={`${styles.CookieClickerLeaderboardRow} ${styles.CookieClickerLeaderboardRowUser}`}
            >
              <p>➡️ {user.display_name}</p>
              <p>{user.count + increment}</p>
            </div>
          )}
        </div>
      </div>

      <div
        className={styles.CookieClickerImage}
        onPointerDown={(e) => onPointerMove(e) && onClick(e)}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setPointer(false)}
        style={{ cursor: pointer ? "pointer" : "default" }}
      >
        <img src="cookie.png" width="100%" />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <label>Display Name: </label>
        <input
          onChange={(e) => setNewName(e.target.value)}
          value={newName || user.display_name}
        />
      </div>

      <ClickAnimation setClickHandler={setClickHandler} duration={1000}>
        <div className={styles.CookieClickerPlusOne}>+1</div>
      </ClickAnimation>
    </div>
  );
}
