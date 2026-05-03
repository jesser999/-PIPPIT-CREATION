"use client";

import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@pippit/shared";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Returns a singleton Socket.IO client connected to the PIPPIT API.
 * Only initialised client-side (safe for SSR — returns null on the server).
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      }
    );

    socket.on("connect", () =>
      console.log("[socket] connected:", socket?.id)
    );
    socket.on("disconnect", (reason) =>
      console.log("[socket] disconnected:", reason)
    );
    socket.on("connect_error", (err) =>
      console.error("[socket] connect error:", err.message)
    );
  }

  return socket;
}
