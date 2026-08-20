import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import "dotenv/config";

const app = express();

const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/*
  userId => Set of socket IDs

  Example:

  user123 => Set(socket1, socket2)
  user456 => Set(socket3)
*/
const activeUsers = new Map();
const lastSeen = new Map();

const getOnlineUserIds = () => [...activeUsers.keys()];

const emitPresence = () => {
  io.emit("presence:update", {
    onlineUserIds: getOnlineUserIds(),
    lastSeen: Object.fromEntries(lastSeen),
  });
};


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user:online", (userId) => {
    if (!userId) return;

    // Socket ke andar userId save kar do
    socket.userId = userId;

    // User ke liye Set create karo
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }

    // Is tab/socket ko add karo
    activeUsers.get(userId).add(socket.id);

    console.log("User online:", userId);
    console.log("Active users:", activeUsers.size);

    // Sab connected users ko new count bhejo
    io.emit("active-users", activeUsers.size);
    emitPresence();
  });

  socket.on("presence:get", () => {
    socket.emit("presence:update", {
      onlineUserIds: getOnlineUserIds(),
      lastSeen: Object.fromEntries(lastSeen),
    });
  });

  socket.on("chat:typing", ({ recipientId, isTyping }) => {
    if (!socket.userId || !recipientId) return;
    for (const socketId of activeUsers.get(recipientId) || []) {
      io.to(socketId).emit("chat:typing", { userId: socket.userId, isTyping: Boolean(isTyping) });
    }
  });

  socket.on("chat:message", ({ recipientId, message }) => {
    if (!socket.userId || !recipientId || !message) return;
    for (const socketId of activeUsers.get(recipientId) || []) {
      io.to(socketId).emit("chat:message", message);
    }
    for (const socketId of activeUsers.get(socket.userId) || []) {
      io.to(socketId).emit("chat:delivered", { messageId: message.id });
    }
  });

  socket.on("chat:read", ({ senderId, messageIds }) => {
    if (!socket.userId || !senderId || !Array.isArray(messageIds)) return;
    for (const socketId of activeUsers.get(senderId) || []) {
      io.to(socketId).emit("chat:read", { readerId: socket.userId, messageIds });
    }
  });


  socket.on("disconnect", () => {
    const userId = socket.userId;

    if (!userId) {
      return;
    }

    const userSockets = activeUsers.get(userId);

    if (!userSockets) {
      return;
    }

    // Current tab/socket remove
    userSockets.delete(socket.id);

    /*
      Agar user ke koi socket remaining nahi hain,
      iska matlab user completely offline hai.
    */
    if (userSockets.size === 0) {
      activeUsers.delete(userId);
      lastSeen.set(userId, new Date().toISOString());

      console.log("User offline:", userId);
    }

    console.log("Active users:", activeUsers.size);

    // Updated count sabko bhejo
    io.emit("active-users", activeUsers.size);
    emitPresence();
  });
});


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Kisan Bazar realtime server is running",
  });
});


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeUsers: activeUsers.size,
  });
});


const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Realtime server running on port ${PORT}`);
});