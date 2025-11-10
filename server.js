import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./db/db.js";
import { ENV } from "./lib/env.js";
import { app, server, io } from "./lib/socket.js"; // if using socket.io

const __dirname = path.resolve();
const PORT = process.env.PORT || ENV.PORT || 3000;

// ✅ Fix CORS properly for Vercel + Render + sockets
app.use(
  cors({
    origin: [
      "https://chat-app-frontend-brown-nine.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ✅ Add a manual OPTIONS handler (important for preflight)
app.options("*", cors({
  origin: [
    "https://chat-app-frontend-brown-nine.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
}));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectDB();
});
