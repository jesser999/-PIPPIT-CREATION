import type { Server } from "socket.io";
import type {
  AssetPendingEvent,
  AssetReadyEvent,
  AssetFailedEvent,
} from "@pippit/shared";

export function emitAssetPending(io: Server, data: AssetPendingEvent) {
  io.to("assets").emit("asset:pending", data);
  console.log(`[socket] asset:pending → ${data.id} (${data.filename})`);
}

export function emitAssetReady(io: Server, data: AssetReadyEvent) {
  io.to("assets").emit("asset:ready", data);
  console.log(`[socket] asset:ready  → ${data.id} (${data.filename})`);
}

export function emitAssetFailed(io: Server, data: AssetFailedEvent) {
  io.to("assets").emit("asset:failed", data);
  console.error(`[socket] asset:failed → ${data.id}: ${data.error}`);
}
