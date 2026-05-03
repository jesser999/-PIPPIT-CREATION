"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type {
  Asset,
  AssetPendingEvent,
  AssetReadyEvent,
  AssetFailedEvent,
} from "@pippit/shared";

export type AssetAction =
  | { type: "ADD_PENDING"; payload: AssetPendingEvent & { createdAt: string } }
  | { type: "MARK_READY"; payload: AssetReadyEvent }
  | { type: "MARK_FAILED"; payload: AssetFailedEvent };

/**
 * Subscribes to asset:pending / asset:ready / asset:failed Socket.IO events
 * and dispatches typed actions to the parent reducer.
 */
export function useAssetSocket(
  dispatch: React.Dispatch<AssetAction>
) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onPending = (data: AssetPendingEvent) => {
      dispatch({
        type: "ADD_PENDING",
        payload: { ...data, createdAt: new Date().toISOString() },
      });
    };

    const onReady = (data: AssetReadyEvent) => {
      dispatch({ type: "MARK_READY", payload: data });
    };

    const onFailed = (data: AssetFailedEvent) => {
      dispatch({ type: "MARK_FAILED", payload: data });
    };

    socket.on("asset:pending", onPending);
    socket.on("asset:ready", onReady);
    socket.on("asset:failed", onFailed);

    return () => {
      socket.off("asset:pending", onPending);
      socket.off("asset:ready", onReady);
      socket.off("asset:failed", onFailed);
    };
  }, [dispatch]);
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function assetReducer(
  state: Partial<Asset>[],
  action: AssetAction
): Partial<Asset>[] {
  switch (action.type) {
    case "ADD_PENDING":
      // Prepend placeholder — avoids duplicate if server already returned it
      if (state.find((a) => a.id === action.payload.id)) return state;
      return [
        {
          id: action.payload.id,
          filename: action.payload.filename,
          folder: action.payload.folder,
          status: "PENDING",
          createdAt: action.payload.createdAt,
        },
        ...state,
      ];

    case "MARK_READY":
      return state.map((a) =>
        a.id === action.payload.id
          ? {
              ...a,
              status: "READY",
              publicUrl: action.payload.publicUrl,
              thumbUrl: action.payload.thumbUrl,
              metadata: action.payload.metadata as any,
            }
          : a
      );

    case "MARK_FAILED":
      return state.map((a) =>
        a.id === action.payload.id ? { ...a, status: "FAILED" } : a
      );

    default:
      return state;
  }
}
