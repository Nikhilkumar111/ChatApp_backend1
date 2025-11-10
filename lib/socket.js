// import { Server } from "socket.io";
// import http from "http";
// import express from "express";
// import { ENV } from "./env.js";
// import  socketAuthMiddleware  from "../middleware/socket.auth.middleware.js";

// const app = express()

// const server = http.createServer(app)

// const io = new Server(server,{
//      cors:{
//           origin:[ENV.CLIENT_URL],
//           credentials:true,
//      },
// });

// //apply authentication middleware to all socket connections
// io.use(socketAuthMiddleware);



// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// const userSocketMap = {};

// io.on("connection",(socket)=>{
//      console.log("A user connected ",socket.user.fullName);

// const userId = socket.userId;
// userSocketMap[userId] = socket.id;

//   // io.emit() is used to send events to all connected clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // with socket.on we listen for events from clients
//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.user.fullName);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };



import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import socketAuthMiddleware from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      ENV.CLIENT_URL,
      "https://chat-app-frontend-brown-nine.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
  const userId = socket.userId;
  if (!userSocketMap[userId]) userSocketMap[userId] = [];
  userSocketMap[userId].push(socket.id);

  console.log(`✅ User connected: ${socket.user.fullName}`);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("video-offer", (data) => {
    getReceiverSocketIds(data.to).forEach((id) => {
      io.to(id).emit("video-offer", { from: userId, offer: data.offer });
    });
  });

  socket.on("video-answer", (data) => {
    getReceiverSocketIds(data.to).forEach((id) => {
      io.to(id).emit("video-answer", { from: userId, answer: data.answer });
    });
  });

  socket.on("ice-candidate", (data) => {
    getReceiverSocketIds(data.to).forEach((id) => {
      io.to(id).emit("ice-candidate", { from: userId, candidate: data.candidate });
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.fullName}`);
    if (userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

console.log("✅ Socket.io CORS allowed origins:", io.opts.cors.origin);

export { io, app, server };
