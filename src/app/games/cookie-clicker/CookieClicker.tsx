import { useDebounce } from "@/util/debounce";
import {
  getUser,
  getTopClickers,
  createUser,
  CookieClickData,
  updateCookieClicks,
  CookieClickUpdate,
} from "@/util/firebase";
import { useEffect, useState } from "react";
import styles from "./CookieClicker.module.css";
import React from "react";
import ClickAnimation from "@/components/ClickAnimation";

export type CookieClickerProps = {
  leaderboard_count?: number;
};

export default function CookieClicker({
  leaderboard_count = 3,
}: CookieClickerProps) {
  const [leaderboard, setLeaderboard] = useState<CookieClickData[]>([]);
  const [user, setUser] = useState({ display_name: "", count: 0, id: "" });
  const [pointer, setPointer] = useState(false);
  const [clickHandler] = useState<(x: number, y: number) => void>();

  const [update, setUpdate] = useState<CookieClickUpdate>();

  useEffect(() => {
    const unsub = getTopClickers(leaderboard_count, setLeaderboard);
    const unsub2 = getUser((user) => {
      if (user) {
        setUser(user);
      } else {
        createUser();
      }
    });
    return () => {
      unsub();
      unsub2();
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const bound = e.currentTarget!.getBoundingClientRect();
    const dy = e.clientY - (bound.top + bound.bottom) / 2;
    const dx = e.clientX - (bound.left + bound.right) / 2;
    const r = (bound.bottom - bound.top + bound.right - bound.left) / 4;
    const inside = dx * dx + dy * dy < r * r;
    setPointer(inside);
    return inside;
  };

  useDebounce(
    (update) => {
      if (update) {
        updateCookieClicks(update);
        setUser({
          display_name: update.displayName,
          id: user.id,
          count: user.count + update.increment,
        });
        setUpdate(undefined);
      }
    },
    update,
    3000
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (onPointerMove(e)) {
      // if clicked more than 50 times, force sync so we don't have to wait for debounce to sync, this keeps the leaderboard updated if the user is constantly clicking
      if (!update) {
        setUpdate({ increment: 1 });
      } else if (update.increment >= 49) {
        updateCookieClicks(update);
        setUpdate({ increment: 1 });
      } else {
        setUpdate({ ...update, increment: update.increment + 1 });
      }
      clickHandler?.(e.clientX, e.clientY);
      return true;
    }
    return false;
  };

  const place = (index: number) => {
    if (index === 0) {
      return "🥇";
    } else if (index === 1) {
      return "🥈";
    } else if (index === 2) {
      return "🥉";
    } else if (isUser(leaderboard[index])) {
      return "➡️";
    } else {
      return "     ";
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
                <p style={{ whiteSpace: "pre" }}>
                  {place(index)} {row.display_name}
                </p>
                <p>
                  {row.count +
                    (isUser(row) && update?.increment ? update.increment : 0)}
                </p>
              </div>
            );
          })}
          {!userIsOnLeaderboard && (
            <div
              className={`${styles.CookieClickerLeaderboardRow} ${styles.CookieClickerLeaderboardRowUser}`}
            >
              <p>➡️ {user.display_name}</p>
              <p>{user.count + (update?.increment ?? 0)}</p>
            </div>
          )}
        </div>
      </div>

      <ClickAnimation
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        duration={1000}
        clickAnimation={<div className={styles.CookieClickerPlusOne}>+1</div>}
      >
        <img
          src="/cookie.png"
          width={250}
          style={{ cursor: pointer ? "pointer" : "default" }}
        />
      </ClickAnimation>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <label>Display Name: </label>
        <input
          onChange={(e) =>
            setUpdate({
              ...(update ?? { increment: 0 }),
              displayName: e.target.value,
            })
          }
          value={update?.displayName ?? user.display_name}
        />
      </div>
    </div>
  );
}
