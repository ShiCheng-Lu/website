"use client";

import { ReactNode, useState, useRef } from "react";
import styles from "./DraggableWindow.module.css";
import { CgCloseO } from "react-icons/cg";

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
  const [updateFunction, setUpdateFunction] = useState<any>();

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
          onMouseDown={(e) => {
            if (typeof window === "undefined") return;

            if (updateFunction) {
              window.removeEventListener("pointermove", updateFunction.update);
            }
            const startX = e.clientX - location.x;
            const startY = e.clientY - location.y;
            // this must be an object reference, otherwise something something to do with states and it doesn't update the state of updateFunction, and we get a null reference on mouse release
            const updateLocation = {
              update: (e: PointerEvent) => {
                if (!e) return;
                setLocation({
                  x: e.clientX - startX,
                  y: e.clientY - startY,
                });
              },
            };
            setUpdateFunction(updateLocation);
            window.addEventListener("pointermove", updateLocation.update);
          }}
          onMouseUp={() => {
            if (typeof window === "undefined") return;

            window.removeEventListener("pointermove", updateFunction.update);
            setUpdateFunction(undefined);
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
