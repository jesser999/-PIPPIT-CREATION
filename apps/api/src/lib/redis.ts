import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Two separate Redis connections are required by @socket.io/redis-adapter:
 *  - pubClient: publishes events
 *  - subClient: subscribes to events
 */
export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const redisSub = redisClient.duplicate();

redisClient.on("connect", () => console.log("✅ Redis pubClient connected"));
redisClient.on("error", (err) => console.error("❌ Redis pubClient error:", err));
redisSub.on("error", (err) => console.error("❌ Redis subClient error:", err));
