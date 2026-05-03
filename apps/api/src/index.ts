import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import cors from "cors";
import { redisClient, redisSub } from "./lib/redis";
import uploadRouter from "./routes/upload";
import assetsRouter from "./routes/assets";
import type { ServerToClientEvents, ClientToServerEvents } from "@pippit/shared";

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO + Redis Adapter ────────────────────────────────────────────────
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.adapter(createAdapter(redisClient, redisSub));

// ─── Express Middleware ───────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "10kb" }));

// Inject Socket.IO server into every request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/upload", uploadRouter);
app.use("/api/assets", assetsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pippit-api", timestamp: new Date().toISOString() });
});

// ─── Socket.IO Connection ─────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[ws] client connected: ${socket.id}`);
  // All clients join the shared 'assets' room for broadcast events
  socket.join("assets");

  socket.on("disconnect", (reason) => {
    console.log(`[ws] client disconnected: ${socket.id} (${reason})`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.API_PORT || "4000", 10);
httpServer.listen(PORT, () => {
  console.log(`🚀 PIPPIT API  →  http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO   →  ws://localhost:${PORT}`);
});

export { io };
