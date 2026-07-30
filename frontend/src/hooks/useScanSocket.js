import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/**
 * Subscribes to live progress for a given scan id.
 * Pass handlers for progress/complete/failed events; they're re-bound
 * automatically if scanId changes.
 */
export function useScanSocket(scanId, { onProgress, onComplete, onFailed } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!scanId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join_scan", scanId);
    if (onProgress) socket.on("scan:progress", onProgress);
    if (onComplete) socket.on("scan:complete", onComplete);
    if (onFailed) socket.on("scan:failed", onFailed);

    return () => {
      socket.emit("leave_scan", scanId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  return socketRef;
}
