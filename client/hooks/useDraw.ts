import { useEffect, useRef, useState } from "react";

export const useDraw = (
  onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void
) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  // add ref for canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // add ref to keep track of previous point
  const prevPoint = useRef<Point | null>(null);

  const onMouseDown = () => {
    console.log("mouse down");
    setIsMouseDown(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    // define mouse event handler
    const handler = (event: MouseEvent) => {
      // if mouse is not down, do nothing
      if (!isMouseDown) return;

      // get current mouse position in canvas
      const currentPoint = computePointInCanvas(event);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !currentPoint) return;

      onDraw({
        ctx,
        currentPoint,
        prevPoint: prevPoint.current,
      });
      prevPoint.current = currentPoint;
    };

    // helper function to compute and return mouse position in canvas only, or null if not in canvas
    const computePointInCanvas = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const mouseUpHandler = () => {
      setIsMouseDown(false);
      prevPoint.current = null;
    };

    // add mouse event listeners to canvas
    canvasRef.current?.addEventListener("mousemove", handler);
    window.addEventListener("mouseup", mouseUpHandler);

    // cleanup event listeners on unmount
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      canvasRef.current?.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [isMouseDown, onDraw]);

  return { canvasRef, onMouseDown, clear };
};
