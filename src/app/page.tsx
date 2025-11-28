"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import DraggableWindow from "@/components/DraggableWindow";
import ReactPlayer from "react-player";
import PaymentPopup from "@/components/PaymentPopup";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { CgInfo, CgUnavailable } from "react-icons/cg";
import { VideoPlayerWindow, VideoPlayer } from "./VideoPlayerWindow";
import Magic8Ball from "@/components/Magic8Ball";
import Advertisement from "@/components/Advertisement";
import { useCookies } from "react-cookie";
import { BsBadgeAd, BsGearFill } from "react-icons/bs";
import QRCode from "react-qr-code";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { TabSwitcher, Tab } from "@/components/TabSwitcher";
import { isMobile } from "react-device-detect";
import { ViolaAdvert } from "./ViolaAdvert";

function isSafari() {
  if (typeof DeviceMotionEvent != "undefined") {
    return typeof (DeviceMotionEvent as any)?.requestPermission === "function";
  } else {
    return false;
  }
}

async function requestMotionPermission() {
  const result = await (DeviceMotionEvent as any).requestPermission();
  return result === "granted";
}

export default function Home() {
  const [subwaySurferOpen, setSubwaySurferOpen] = useState(true);
  const [minecraftParkourOpen, setMinecraftParkourOpen] = useState(true);
  const [magic8BallOpen, setMagic8BallOpen] = useState(false);
  const [payment, setPayment] = useState("");
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(true);
    setMagic8BallOpen(!isSafari());
  }, []);

  const [cookies] = useCookies([
    "disableBrainRot",
    "disableAd",
    "disable8Ball",
    "acceptedPolicy",
    "useTabs",
  ]);

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

      {!magic8BallOpen && isSafari() && (
        <p
          className={styles.navButton}
          onClick={() => {
            requestMotionPermission().then((granted) => {
              if (granted) {
                setMagic8BallOpen(true);
              } else {
                alert(
                  "You didn't grant motion permission, reset permission status by closing Safari and re-opening it"
                );
              }
            });
          }}
        >
          You're on Safari, so you need to grant permission to use the 8 ball,
          Shake your device to get a fortune.
        </p>
      )}

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

      <QRCode value={"https://shicheng.lu"} style={{ margin: "3rem" }}></QRCode>

      <Link className={styles.settings} href="/settings">
        <BsGearFill />
      </Link>

      {!isMobile && !cookies.disable8Ball && initialized && magic8BallOpen && (
        <Magic8Ball />
      )}

      {!isMobile && !cookies.acceptedPolicy && initialized && <PrivacyPolicy />}

      {!isMobile && !cookies.disableAd && initialized && (
        <div
          style={{
            position: "fixed",
            right: 50,
            top: 150,
            width: "30%",
            height: "auto",
          }}
        >
          <ViolaAdvert />
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

      {!isMobile && !cookies.disableBrainRot && (
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

      {(isMobile || cookies.useTabs) && (
        <TabSwitcher>
          <Tab tab="🎱">
            <Magic8Ball fixedPosition />
          </Tab>
          <Tab tab={<img width={32} src="logos/subway-surfer.png" />}>
            <VideoPlayer src="subway-surfers.mp4" />
          </Tab>
          <Tab tab={<img width={24} src="logos/minecraft.png" />}>
            <VideoPlayer src="minecraft-parkour.mp4" />
          </Tab>
          <Tab tab={<BsBadgeAd />}>
            <div
              style={{
                width: 300,
                height: "auto",
              }}
            >
              <ViolaAdvert />
            </div>
          </Tab>
        </TabSwitcher>
      )}
    </div>
  );
}
