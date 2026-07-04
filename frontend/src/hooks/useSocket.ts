import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

/**
 * Subscribe to a Socket.io event. Automatically unsubscribes on unmount.
 * @param event    The event name (e.g. 'notification', 'comment:new')
 * @param handler  Callback called whenever the event fires
 */
export function useSocket<T = unknown>(event: string, handler: (data: T) => void) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}

/**
 * Join / leave a Socket.io room when the component mounts / unmounts.
 * Useful for watching a specific issue page so comment events are scoped.
 */
export function useJoinRoom(room: string | null | undefined) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || !room) return;
    socket.emit('join:room', room);
    return () => {
      socket.emit('leave:room', room);
    };
  }, [socket, room]);
}
