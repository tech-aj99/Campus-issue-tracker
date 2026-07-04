import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL || '',
      ].filter(Boolean),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string | undefined;
    const role = socket.handshake.query.role as string | undefined;

    console.log(`🔌 Socket connected: ${socket.id}${userId ? ` (user: ${userId})` : ''}`);

    // Join personal notification room
    if (userId) {
      socket.join(userId);
    }

    // Join admin broadcast room
    if (role === 'ADMIN') {
      socket.join('admin');
    }

    // Let clients join/leave issue-specific rooms (for real-time comments)
    socket.on('join:room', (room: string) => {
      socket.join(room);
    });

    socket.on('leave:room', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export type IssueEventType = 'issue:created' | 'issue:status_changed' | 'issue:assigned';

export const emitIssueEvent = (
  event: IssueEventType,
  payload: {
    issueId: string;
    title: string;
    status?: string;
    assignedTo?: string;
    raisedBy?: string;
    building?: string;
    priority?: string;
  }
) => {
  try {
    getIO().emit(event, { ...payload, timestamp: new Date().toISOString() });
  } catch {
    // Socket not initialized yet (e.g., during startup) — silently skip
  }
};
