"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require("express");
// const http = require("http");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const port = process.env.PORT || 8000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);
    socket.on("client-ready", () => {
        socket.broadcast.emit("get-canvas-state");
    });
    socket.on("canvas-state", (dataURL) => {
        socket.broadcast.emit("canvas-state-from-server", dataURL);
    });
    socket.on("draw-line", ({ prevPoint, currentPoint, color, lineWidth }) => {
        socket.broadcast.emit("draw-line", {
            prevPoint,
            currentPoint,
            color,
            lineWidth,
        });
    });
    socket.on("clear", () => {
        io.emit("clear");
    });
});
server.listen(port, () => {
    console.log(`server running & listening on port ${port}`);
});
