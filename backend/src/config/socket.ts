/**
 * src/config/socket.ts
 * Thin re-export kept for backward-compatibility.
 * The real Socket.io instance lives in utils/socketServer.ts
 * (already imported by server.ts via initSocket / getIO).
 *
 * Use getIO() from utils/socketServer anywhere you need the io instance.
 */
export { initSocket, getIO } from '../utils/socketServer';
