"use client";

import { ReactNode, useState } from "react";
import styles from "./DraggableWindow.module.css";
import { CgCloseO } from "react-icons/cg";

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
  onClose?: () => void;
  children?: any;
  initialX?: number;
  initialY?: number;
};

export default function DraggableWindow({
  opened = true,
  onClose = () => {},
  title,
  children,
  initialX = 0,
  initialY = 0,
}: DraggableWindowProps) {
  const [location, setLocation] = useState({ x: initialX, y: initialY });
  const [updateFunction, setUpdateFunction] = useState<DragHandler>();

  return (
    opened && (
      <div
        className={styles.DraggableWindow}
        style={{
          top: location.y,
          left: location.x,
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
            onClick={onClose}
          />
        </div>
        {children}
      </div>
    )
  );
}
