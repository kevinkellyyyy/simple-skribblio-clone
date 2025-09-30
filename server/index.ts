// const express = require("express");
// const http = require("http");
import express from "express";
import http from "http";
import { Server } from "socket.io";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const app = express();
const server = http.createServer(app);

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

app.get("/", (_req, res) => res.send("OK"));
app.get("/healthz", (_req, res) => res.send("healthy"));

server.listen(Number(process.env.PORT) || 3001, "0.0.0.0", () => {
  console.log(`server running & listening on port ${port}`);
});
