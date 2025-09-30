"use client";

import { FC, useEffect, useState } from "react";
import { useDraw } from "../hooks/useDraw";
import { ChromePicker } from "react-color";
import { drawLine } from "../utils/drawLine";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);

  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    setMounted(true);

    const ctx = canvasRef.current?.getContext("2d");

    // Notify the server that the new client is ready
    socket.emit("client-ready");

    // Request the current canvas state from the server
    socket.on("get-canvas-state", () => {
      // check if canvasRef.current is defined and has a toDataURL method (long base64 string that represents the drawing on the canvas)
      if (!canvasRef.current?.toDataURL()) return;
      // Send the current canvas state to the server
      socket.emit("canvas-state", canvasRef.current.toDataURL());
    });

    socket.on("canvas-state-from-server", (dataURL: string) => {
      // console.log("Received canvas state from server");
      const img = new Image();
      img.src = dataURL;
      img.onload = () => {
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx?.drawImage(img, 0, 0);
      };
    });

    // Listen for draw-line events from the server and draw them on the canvas in real-time for all connected clients
    socket.on("draw-line", (data) => {
      if (!ctx) return;
      drawLine({
        prevPoint: data.prevPoint,
        currentPoint: data.currentPoint,
        ctx,
        selectedColor: data.color,
        lineWidth: data.lineWidth,
      });
    });

    socket.on("clear", clear);

    // Cleanup all socket listeners on unmount
    return () => {
      socket.off("get-canvas-state");
      socket.off("canvas-state-from-server");
      socket.off("draw-line");
      socket.off("clear");
    };
  }, [canvasRef, clear]);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit("draw-line", {
      prevPoint,
      currentPoint,
      color: selectedColor,
      lineWidth,
    });
    drawLine({
      prevPoint,
      currentPoint,
      ctx,
      selectedColor,
      lineWidth,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
  };

  // Handler for slider change
  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(Number(e.target.value));
  };

  // Handler for clear button
  const handleClearCanvas = () => {
    clear();
    socket.emit("clear");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <canvas
        onMouseDown={onMouseDown}
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-black rounded-md"
      />
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="my-4 flex flex-col items-center">
            <label htmlFor="linewidth-slider" className="mb-2">
              Line Width: {lineWidth}
            </label>
            <input
              id="linewidth-slider"
              type="range"
              min={1}
              max={100}
              value={lineWidth}
              onChange={handleLineWidthChange}
            />
          </div>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={handleClearCanvas}
          >
            Clear Canvas
          </button>
        </div>
        {mounted && (
          <ChromePicker color={selectedColor} onChange={handleColorChange} />
        )}
      </div>
    </div>
  );
};

export default Page;
