"use client";

import { CSSProperties, ReactNode, useEffect, useState } from "react";
import styles from "./DraggableWindow.module.css";
import { CgCloseO } from "react-icons/cg";
import { Point } from "@/util/point";

export class DragHandler {
  startX: number;
  startY: number;
  setLocation: (location: any) => void = () => {};

  funcRef: any;
  stopFuncRef: any;

  constructor(
    startX: number,
    startY: number,
    setLocation: (location: any) => void
  ) {
    this.startX = startX;
    this.startY = startY;
    this.setLocation = setLocation;
  }

  update(e: { clientX: number; clientY: number }) {
    if (!e) return;

    this.setLocation({
      x: e.clientX - this.startX,
      y: e.clientY - this.startY,
    });
  }

  start() {
    this.funcRef = this.update.bind(this);
    window.addEventListener("pointermove", this.funcRef);
    this.stopFuncRef = this.stop.bind(this);
    window.addEventListener("pointerup", this.stopFuncRef);
  }

  stop() {
    if (this.funcRef) {
      window.removeEventListener("pointermove", this.funcRef);
      this.funcRef = undefined;
    }
    if (this.stopFuncRef) {
      window.removeEventListener("pointerup", this.stopFuncRef);
      this.stopFuncRef = undefined;
    }
  }
}

export type DraggableWindowProps = {
  opened?: boolean;
  title?: ReactNode;
  onClose?: () => Promise<boolean>;
  children?: any;
  initialPosition?: Point;
  width?: number;
  height?: number;
  style?: CSSProperties;
};

export default function DraggableWindow({
  onClose = async () => true,
  title,
  children,
  initialPosition,
  width = 0,
  height = 0,
  style,
}: DraggableWindowProps) {
  const [opened, setOpen] = useState(true);
  const [location, setLocation] = useState<{ x: number; y: number }>();
  const [updateFunction, setUpdateFunction] = useState<DragHandler>();

  useEffect(() => {
    if (initialPosition) {
      setLocation(initialPosition);
    } else if (typeof window != "undefined") {
      setLocation({
        x: Math.random() * (window.innerWidth - width),
        y: Math.random() * (window.innerHeight - height),
      });
    } else {
      setLocation({ x: 0, y: 0 });
    }
  }, []);

  return (
    opened &&
    location && (
      <div
        className={styles.DraggableWindow}
        style={{
          top: location.y,
          left: location.x,
          ...style,
        }}
      >
        <div
          className={styles.DraggableWindowHeader}
          onPointerDown={(e) => {
            if (typeof window === "undefined") return;

            if (updateFunction) {
              updateFunction.stop();
            }
            // this must be an object reference, otherwise something something to do with states and it doesn't update the state of updateFunction, and we get a null reference on mouse release
            const updateLocation = new DragHandler(
              e.clientX - location.x,
              e.clientY - location.y,
              setLocation
            );
            updateLocation.start();
            setUpdateFunction(updateLocation);
          }}
        >
          <div className={styles.DraggableWindowTitle}>{title}</div>
          <CgCloseO
            className={styles.DraggableWindowCloseIcon}
            onClick={async () => {
              if (await onClose()) {
                setOpen(false);
              }
            }}
          />
        </div>
        {children}
      </div>
    )
  );
}
