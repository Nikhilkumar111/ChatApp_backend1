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
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// Apply authentication middleware
io.use(socketAuthMiddleware);

// Map of userId → array of socketIds
const userSocketMap = {};

// ✅ Helper: get all socket IDs for a user
export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] || [];
}

// Socket.io connection
io.on("connection", (socket) => {
  const userId = socket.userId;

  // Add socket to the user's array
  if (!userSocketMap[userId]) userSocketMap[userId] = [];
  userSocketMap[userId].push(socket.id);

  console.log(`A user connected: ${socket.user.fullName}`);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 🔹 Video Call Signaling Events
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

  // Disconnect event
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.user.fullName}`);
    if (userSocketMap[userId]) {
      // Remove only this socket ID
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);

      // Delete user if no sockets left
      if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ✅ Only export these
export { io, app, server };
