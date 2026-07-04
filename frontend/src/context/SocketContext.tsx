import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

const SOCKET_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ||
  'http://localhost:5000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect once auth is resolved
    if (!isAuthenticated || !user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      // Pass userId + role so the server joins the personal room on connect
      query: {
        userId: user.id,
        role: user.role,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`🔌 Socket connected: ${socket.id} (user: ${user.id})`);
    });

    // Support join/leave room events emitted by useJoinRoom hook
    socket.on('join:room', (room: string) => socket.join?.(room));
    socket.on('leave:room', (room: string) => socket.leave?.(room));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);
