import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection
 */
export function connectSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            // Remove explicit transports to allow default (polling -> websocket) upgrade
            // This is often more stable
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket.io connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket.io disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });
    }

    return socket;
}

/**
 * Get existing socket instance
 */
export function getSocket(): Socket | null {
    return socket;
}

/**
 * Join a chat room
 */
export function joinRoom(roomId: string): void {
    if (!socket) {
        throw new Error('Socket not initialized. Call connectSocket() first.');
    }
    socket.emit('join-room', roomId);
    console.log('Joined room:', roomId);
}

/**
 * Send a message to a room
 */
export function sendMessage(
    roomId: string,
    message: string,
    senderId: string,
    senderName: string
): void {
    if (!socket) {
        throw new Error('Socket not initialized. Call connectSocket() first.');
    }

    socket.emit('send-message', {
        roomId,
        message,
        senderId,
        senderName,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Listen for incoming messages
 */
export function onReceiveMessage(
    callback: (data: {
        message: string;
        senderId: string;
        senderName: string;
        timestamp: string;
    }) => void
): void {
    if (!socket) {
        throw new Error('Socket not initialized. Call connectSocket() first.');
    }

    // Remove any existing listeners first to prevent duplicates
    socket.off('receive-message');

    // Add the new listener
    socket.on('receive-message', callback);
}

/**
 * Remove message listener
 */
export function offReceiveMessage(): void {
    if (socket) {
        socket.off('receive-message');
    }
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected');
    }
}
