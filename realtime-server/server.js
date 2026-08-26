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
const activeCalls = new Map();

const getOnlineUserIds = () => [...activeUsers.keys()];

const emitPresence = () => {
  io.emit("presence:update", {
    onlineUserIds: getOnlineUserIds(),
    lastSeen: Object.fromEntries(lastSeen),
  });
};

const emitToUser = (userId, event, payload) => {
  for (const socketId of activeUsers.get(userId) || []) {
    io.to(socketId).emit(event, payload);
  }
};


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user:online", (userId) => {
    if (!userId) return;

  
    socket.userId = userId;

    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }

    activeUsers.get(userId).add(socket.id);

    console.log("User online:", userId);
    console.log("Active users:", activeUsers.size);

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

  socket.on("call:start", ({ callId, recipientId, callerName }) => {
    if (!socket.userId || !callId || !recipientId) return;
    const existingCall = [...activeCalls.values()].find(
      (call) => call.callerId === recipientId || call.recipientId === recipientId,
    );
    if (existingCall) {
      socket.emit("call:busy", { callId });
      return;
    }
    activeCalls.set(callId, { callerId: socket.userId, recipientId });
    if (!activeUsers.has(recipientId)) {
      activeCalls.delete(callId);
      socket.emit("call:unavailable", { callId });
      return;
    }
    emitToUser(recipientId, "call:incoming", {
      callId,
      callerId: socket.userId,
      callerName: callerName || "Incoming call",
    });
  });

  socket.on("call:signal", ({ callId, recipientId, type, signal }) => {
    const call = activeCalls.get(callId);
    const expectedRecipient = call?.callerId === socket.userId ? call.recipientId : call?.callerId;
    if (!call || expectedRecipient !== recipientId || !type || !signal) return;
    emitToUser(recipientId, "call:signal", { callId, type, signal });
  });

  socket.on("call:accept", ({ callId, callerId }) => {
    const call = activeCalls.get(callId);
    if (!call || call.recipientId !== socket.userId || call.callerId !== callerId) return;
    emitToUser(callerId, "call:accepted", { callId });
  });

  socket.on("call:reject", ({ callId, callerId }) => {
    const call = activeCalls.get(callId);
    if (!call || call.recipientId !== socket.userId || call.callerId !== callerId) return;
    activeCalls.delete(callId);
    emitToUser(callerId, "call:rejected", { callId });
  });

  socket.on("call:end", ({ callId }) => {
    const call = activeCalls.get(callId);
    if (!call || ![call.callerId, call.recipientId].includes(socket.userId)) return;
    activeCalls.delete(callId);
    emitToUser(socket.userId === call.callerId ? call.recipientId : call.callerId, "call:ended", { callId });
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

    for (const [callId, call] of activeCalls) {
      if (call.callerId === userId || call.recipientId === userId) {
        activeCalls.delete(callId);
        emitToUser(
          call.callerId === userId ? call.recipientId : call.callerId,
          "call:ended",
          { callId },
        );
      }
    }


    userSockets.delete(socket.id);


    if (userSockets.size === 0) {
      activeUsers.delete(userId);
      lastSeen.set(userId, new Date().toISOString());

      console.log("User offline:", userId);
    }

    console.log("Active users:", activeUsers.size);


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