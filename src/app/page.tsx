"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import DraggableWindow from "@/components/DraggableWindow";
import ReactPlayer from "react-player";
import PaymentPopup from "@/components/PaymentPopup";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { CgInfo, CgUnavailable } from "react-icons/cg";
import VideoPlayerWindow from "./VideoPlayerWindow";
import Magic8Ball from "@/components/Magic8Ball";
import Advertisement from "@/components/Advertisement";
import { useCookies } from "react-cookie";
import { BsGearFill } from "react-icons/bs";

export default function Home() {
  const [subwaySurferOpen, setSubwaySurferOpen] = useState(true);
  const [minecraftParkourOpen, setMinecraftParkourOpen] = useState(true);
  const [payment, setPayment] = useState("");
  const [initialized, setInitialized] = useState(false);
  useEffect(() => setInitialized(true), []);

  const [cookies] = useCookies(["brainRotOff", "adOff"]);

  return (
    <div className={styles.page}>
      <h1>Is this a website?</h1>
      <br />
      <div>
        <div className={styles.intro}>
          <p
            className={styles.quote}
            style={{ top: 0, left: 0, transform: "translate(-20px, -30px)" }}
          >
            “
          </p>
          <p>
            Sure! Here’s a self-introduction with an intentionally
            "AI-generated" vibe for your website:
          </p>
          <br />
          <hr />
          <br />
          <p>
            Greetings. I am a human programmer engaged in the creation of
            various digital projects. My work spans multiple domains and
            technologies, driven by exploration and an ongoing pursuit of
            knowledge. I produce a range of applications, tools, and systems —
            each one an experiment, an iteration, or a solution, depending on
            the parameters at hand.
          </p>
          <br />
          <p>
            This site serves as a catalog of these endeavors, showcasing a
            diverse set of outputs derived from curiosity, computational logic,
            and occasional unpredictability. You are invited to explore the
            results of these activities. Your engagement is both expected and
            welcomed. Thank you for visiting.
          </p>
          <p
            className={styles.quote}
            style={{ bottom: 0, right: 0, transform: "translate(20px, 50px)" }}
          >
            ”
          </p>
        </div>
        <div className={styles.quoteAttribution}>
          <p>— ChatGippity</p>
          <CgInfo
            data-tooltip-id="ai-info"
            data-tooltip-content="One of the few times I'll exploit the power of GPT"
          />
          <Tooltip id="ai-info" />
        </div>
      </div>

      {/* TODO: make this a ThreeJS rendered scene
      <Link className={styles.navButton} href="/archery">
        Try archery? 🏹
      </Link> */}

      <Link className={styles.navButton} href="https://github.com/ShiCheng-Lu">
        More of PROgrammer 💻
      </Link>

      <Link className={styles.navButton} href="/minecraft-computer">
        Minecraft Computer?
      </Link>

      <Link className={styles.navButton} href="/jsfuck">
        I heard ya like JavaScript
      </Link>

      <Link className={styles.settings} href="/settings">
        <BsGearFill />
      </Link>

      <Magic8Ball></Magic8Ball>

      {!cookies.adOff && initialized && (
        <div style={{ position: "absolute", right: 50 }}>
          <Advertisement>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h1>NO MORE VIOLINS</h1>
              <div style={{ position: "relative", width: 500, height: 350 }}>
                <img
                  src="violin.png"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(60deg)",
                  }}
                ></img>
                <CgUnavailable
                  size={400}
                  color="darkred"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <h1>VIOLINS IS NOT THE ANSWER</h1>
              <p
                style={{
                  marginLeft: "auto",
                  marginRight: 20,
                  fontSize: 12,
                  transform: "translate(0, -10px)",
                }}
              >
                this message is brought to you by viola gang
              </p>
            </div>
          </Advertisement>
        </div>
      )}

      {/* 
      Overlays
      */}
      {payment && (
        <PaymentPopup
          onSubmit={() => {
            if (payment === "subway-surfer") {
              setSubwaySurferOpen(false);
            }
            if (payment === "minecraft-parkour") {
              setMinecraftParkourOpen(false);
            }
            setPayment("");
          }}
        ></PaymentPopup>
      )}

      {!cookies.brainRotOff && (
        <>
          <VideoPlayerWindow
            title={<p className={styles.videoTitle}>For the zoomers</p>}
            src="subway-surfers.mp4"
            onClose={() => {
              setPayment("subway-surfer");
            }}
            open={subwaySurferOpen}
          />
          <VideoPlayerWindow
            title={<p className={styles.videoTitle}>For the boomers</p>}
            src="minecraft-parkour.mp4"
            onClose={() => {
              setPayment("minecraft-parkour");
            }}
            open={minecraftParkourOpen}
          />
        </>
      )}
    </div>
  );
}
