import { useDebounce } from "@/util/debounce";
import {
  getUser,
  getTopClickers,
  updateDisplayName,
  createUser,
  CookieClickData,
  clickCookie,
} from "@/util/firebase";
import { useEffect, useState } from "react";
import styles from "./CookieClicker.module.css";

function useCookieClickerData() {
  // const data = []; // list of top 10 users + the current user
  // return { data };
}

export default function CookieClicker() {
  const [leaderboard, setLeaderboard] = useState<CookieClickData[]>([]);
  const [user, setUser] = useState({ display_name: "", count: 0, id: "" });
  const [increment, setIncrement] = useState(0);
  const [newName, setNewName] = useState<string>();
  const [pointer, setPointer] = useState(false);

  useEffect(() => {
    const unsub = getTopClickers(setLeaderboard);
    getUser()
      .then(setUser)
      .catch(() => createUser().then(setUser));
    return unsub;
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

  const onClick = () => {
    // if clicked more than 50 times, force sync so we don't have to wait for debounce
    if (increment > 50) {
      clickCookie(increment + 1);
      setIncrement(0);
    } else {
      setIncrement(increment + 1);
    }
  };

  const place = (index: number) => {
    if (index === 0) {
      return "🥇";
    } else if (index === 1) {
      return "🥈";
    } else if (index === 2) {
      return "🥉";
    } else {
      return "  ";
    }
  };

  const isUser = (data: CookieClickData) => {
    return data.id === user.id;
  };
  const userIsOnLeaderboard =
    leaderboard.find((row) => row.id === user.id) !== undefined;

  return (
    <div className={styles.CookieClicker}>
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
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
            <div className={styles.CookieClickerLeaderboardRow}>
              <p>{user.display_name}</p>
              <p>{user.count + increment}</p>
            </div>
          )}
        </div>
      </div>

      <div
        onPointerDown={(e) => onPointerMove(e) && onClick()}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setPointer(false)}
        style={{
          border: "0px solid black",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: pointer ? "pointer" : "default",
          width: 250,
        }}
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
    </div>
  );
}
