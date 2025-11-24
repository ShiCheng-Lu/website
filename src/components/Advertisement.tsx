import { useState } from "react";
import styles from "./Advertisement.module.css";

export type AdvertisementProps = {
  children: any;
};

export default function Advertisement({ children }: AdvertisementProps) {
  const [shown, setShown] = useState(true);
  const [why, setWhy] = useState(false);

  return (
    shown && (
      <div className={styles.AdvertisementContainer}>
        <label>ADVERTISEMENT</label>
        {/* disclaimer */}
        <div style={{ position: "relative" }}>
          {children}

          {/* <div>AdChoices</div> */}
          <div
            className={styles.AdvertisementContainerAdChoice}
            onClick={() => setWhy(!why)}
            style={why ? { left: 0 } : { right: 0 }}
          >
            <img src="logos/adchoices.png" width={16}></img>
          </div>

          {why && (
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                background: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
              }}
            >
              <h2>Ads by Yours Truly</h2>

              <a onClick={() => setShown(false)}>Stop seeing this ad</a>

              <a
                onClick={() =>
                  alert("This message is brought to you by viola gang")
                }
              >
                Why this ad?
              </a>
            </div>
          )}
        </div>
      </div>
    )
  );
}
