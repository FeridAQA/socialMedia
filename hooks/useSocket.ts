// hooks/useSocket.ts
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { addMessage } from '@/app/store/messageSlice';
import { addChat, updateChat } from '@/app/store/chatSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.emit('auth', { token });

    socket.on('auth', (res) => {
      console.log('Socket authenticated:', res);
    });

    socket.on('message.create', (message) => {
      dispatch(addMessage({ chatId: message.chat.id, message }));
    });

    socket.on('chat.create', (chat) => {
      dispatch(addChat(chat));
    });

    socket.on('chat.update', (chat) => {
      dispatch(updateChat(chat));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, dispatch]);

  return socketRef;
};
