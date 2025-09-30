"use client";

import { FC, useEffect, useState } from "react";
import { useDraw } from "../hooks/useDraw";
import { ChromePicker } from "react-color";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);

  const { canvasRef, onMouseDown, clear } = useDraw(drawLine);

  useEffect(() => {
    setMounted(true);
  }, []);

  function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = selectedColor;

    const startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, lineWidth, 0, 0);
    ctx.fill();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
  };

  // Handler for slider change
  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(Number(e.target.value));
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
            onClick={clear}
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
