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
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

// ✅ Use Render's PORT if available
const PORT = process.env.PORT || ENV.PORT || 3000;

// Middleware
// ✅ Enable CORS properly

app.use(express.json({ limit: "5mb" }));
app.use(cors({
  origin: ["http://localhost:5173","https://chatapp-backend-4-15do.onrender.com"],
  credentials: true
}));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Optional: serve frontend in production
// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));
//   app.get("*", (_, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// Start server
server.listen(PORT, () => {
  console.log("Server running on port :" + PORT);
  connectDB();
});
