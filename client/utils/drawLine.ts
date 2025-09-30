type DrawLineProps = Draw & {
  selectedColor: string;
  lineWidth: number;
};

export function drawLine({
  prevPoint,
  currentPoint,
  ctx,
  selectedColor,
  lineWidth,
}: DrawLineProps) {
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
