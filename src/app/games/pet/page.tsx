"use client";

import { useRef, useState } from "react"


export default function Pets() {
    const size = 20;
    const [data, setData] = useState(Array(16).fill(Array(16).fill(0)));
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState(1);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [palette, setPalette] = useState(['#0000', '#111f']);

    const draw = (e: React.PointerEvent) => {
        const context = canvas.current?.getContext('2d');
        if (context == null) {
            return;
        }
        const bounds = e.currentTarget.getBoundingClientRect();

        const x = Math.floor((e.clientX - bounds.x) / size);
        const y = Math.floor((e.clientY - bounds.y) / size);

        context.fillStyle = palette[color];
        context.fillRect(x * size, y * size, size, size);
    }

    const onPointerUp = (e: React.PointerEvent) => {
        setDrawing(false);
    }

    const onPointerDown = (e: React.PointerEvent) => {
        setDrawing(true);
        draw(e);
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (drawing) {
            draw(e);
        }
    }

    return <div>
        <img src={"/transparent.png"} width={16 * size} height={16 * size} style={{
        }} />
        <canvas
            style={{
                border: "solid #f00f 1px",
            }}
            width={16 * size}
            height={16 * size}
            ref={canvas}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
        />

        <input type="radio" name="color" />
        <input type="radio" name="color" />
        <input type="radio" name="color" />

    </div>
}