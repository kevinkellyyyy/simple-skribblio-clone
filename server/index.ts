const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

type Point = { x: number; y: number };

type DrawLine = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  lineWidth: number;
};

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("client-ready", () => {
    socket.broadcast.emit("get-canvas-state");
  });

  socket.on("canvas-state", (dataURL: string) => {
    socket.broadcast.emit("canvas-state-from-server", dataURL);
  });

  socket.on(
    "draw-line",
    ({ prevPoint, currentPoint, color, lineWidth }: DrawLine) => {
      socket.broadcast.emit("draw-line", {
        prevPoint,
        currentPoint,
        color,
        lineWidth,
      });
    }
  );

  socket.on("clear", () => {
    io.emit("clear");
  });
});

server.listen(3001, () => {
  console.log("listening on port 3001");
});
