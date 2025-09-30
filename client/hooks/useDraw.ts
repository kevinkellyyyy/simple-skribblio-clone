import { useEffect, useRef, useState } from "react";

export const useDraw = (
  onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  // add ref for canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // add ref to keep track of previous point
  const prevPoint = useRef<Point | null>(null);

  const onMouseDown = () => {
    // console.log("mouse down");
    setIsDrawing(true);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    // console.log("touch start");
    setIsDrawing(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    // Helper function to get point from mouse or touch event
    const computePointInCanvas = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    // Mouse event handler
    const mouseHandler = (event: MouseEvent) => {
      if (!isDrawing) return;
      const currentPoint = computePointInCanvas(event.clientX, event.clientY);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !currentPoint) return;

      onDraw({
        ctx,
        currentPoint,
        prevPoint: prevPoint.current,
      });
      prevPoint.current = currentPoint;
    };

    // Touch event handler
    const touchHandler = (event: TouchEvent) => {
      event.preventDefault(); // Prevent scrolling
      if (!isDrawing) return;

      const touch = event.touches[0];
      if (!touch) return;

      const currentPoint = computePointInCanvas(touch.clientX, touch.clientY);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !currentPoint) return;

      onDraw({
        ctx,
        currentPoint,
        prevPoint: prevPoint.current,
      });
      prevPoint.current = currentPoint;
    };

    const endHandler = () => {
      setIsDrawing(false);
      prevPoint.current = null;
    };

    // Add event listeners
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", mouseHandler);
      canvas.addEventListener("touchmove", touchHandler, { passive: false });
    }

    window.addEventListener("mouseup", endHandler);
    window.addEventListener("touchend", endHandler);

    // Cleanup event listeners on unmount
    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", mouseHandler);
        canvas.removeEventListener("touchmove", touchHandler);
      }
      window.removeEventListener("mouseup", endHandler);
      window.removeEventListener("touchend", endHandler);
    };
  }, [isDrawing, onDraw]);

  return { canvasRef, onMouseDown, onTouchStart, clear };
};
