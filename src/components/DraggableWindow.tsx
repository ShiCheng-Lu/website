"use client";

import { useState } from "react";

export type DraggableWindowProps = {
  opened?: boolean;
  title?: string;
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
  initialY= 0
}: DraggableWindowProps) {
  const [location, setLocation] = useState({ x: initialX, y: initialY });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  return (
    opened && (
      <div
        className="DraggableWindow"
        style={{
          zIndex: 1,
          position: "absolute",
          top: location.y,
          left: location.x,

          borderWidth: 10,
          borderRadius: 5,
          border: "gray solid"
        }}
      >
        <div
          className="Header"
          style={{
            background: "grey",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}
          onDrag={(e) => {
            setLocation({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y,
            });
          }}
          onDragStart={(e) => {
            setDragStart({
              x: e.clientX - location.x,
              y: e.clientY - location.y,
            });
          }}
          onDragEnd={(e) => {
            setLocation({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y,
            });
          }}
          draggable
        >
          <div className="Title">{title}</div>
          <div>
            <button onClick={onClose}>X</button>
          </div>
        </div>
        {children}
      </div>
    )
  );
}
