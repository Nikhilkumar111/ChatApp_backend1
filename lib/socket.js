import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import socketAuthMiddleware from "../middleware/socket.auth.middleware.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// ----------------- CORS FOR REST + SOCKET.IO -----------------
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chat-app-frontend-brown-nine.vercel.app"
  ],
  credentials: true,
}));
app.options("*", cors()); // handle preflight
app.use(express.json({ limit: "5mb" }));
// -------------------------------------------------------------

// ----------------- SOCKET.IO -----------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chat-app-frontend-brown-nine.vercel.app"
    ],
    credentials: true,
  },
});

// Apply authentication middleware for all socket connections
io.use(socketAuthMiddleware);

// Map of userId → array of socketIds
const userSocketMap = {};

export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
  const userId = socket.userId;

  if (!userSocketMap[userId]) userSocketMap[userId] = [];
  userSocketMap[userId].push(socket.id);

  console.log(`A user connected: ${socket.user.fullName}`);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Video call signaling events
  socket.on("video-offer", (data) => {
    const receiverSocketIds = getReceiverSocketIds(data.to);
    receiverSocketIds.forEach((id) => {
      io.to(id).emit("video-offer", { from: userId, offer: data.offer });
    });
  });

  socket.on("video-answer", (data) => {
    const receiverSocketIds = getReceiverSocketIds(data.to);
    receiverSocketIds.forEach((id) => {
      io.to(id).emit("video-answer", { from: userId, answer: data.answer });
    });
  });

  socket.on("ice-candidate", (data) => {
    const receiverSocketIds = getReceiverSocketIds(data.to);
    receiverSocketIds.forEach((id) => {
      io.to(id).emit("ice-candidate", { from: userId, candidate: data.candidate });
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.user.fullName}`);
    if (userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
