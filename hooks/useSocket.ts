// hooks/useSocket.ts
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { addMessage } from '@/app/store/messageSlice';
import { addChat, updateChat } from '@/app/store/chatSlice';
import { Chat } from './useChatList';
import { ChatMessage } from './useChatMessages'; // ChatMessage tipini import edin

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('useSocket: Socket artıq bağlıdır, yenidən əlaqə qurulmur.');
      return;
    }
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        console.log('useSocket: Token yoxdur və ya autentikasiya olunmayıb, socket bağlantısı kəsilir.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    console.log('useSocket: Socket.IO bağlantısı qurulur...');
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('useSocket: Socket.IO qoşuldu!');
      socket.emit('auth', { token });
    });

    socket.on('auth', (res) => {
      console.log('Socket authenticated:', res);
    });

    // ****** BURADAKI DƏYİŞİKLİK - Payload birbaşa ChatMessage obyekti kimi qəbul edilir ******
    // Sizin son logunuza əsasən `message.create` eventi birbaşa ChatMessage obyekti göndərir.
    // Backend-də `this.server.to(chatId.toString()).emit('message.create', { message: messageToSend, updatedChat: updatedChatForFrontend });`
    // kimi göndərirdinizsə, o zaman payload `object` olaraq gəlir və onun içində `message` property-si var idi.
    // Lakin, `useSocket: message.create payload'unda chat ID tapılmadı (message.chat.id yoluyla): {message: 'yyyyy', ...}`
    // logu göstərir ki, `payload`ın özü ChatMessage-dir.
    // İndi backend tərəfdə `message.create` necə emit olunur, o hissəni dəqiqləşdirmək lazımdır.
    // Ən son verdiyim backend kodu (socket.gateway.ts) bu formatda göndərirdi:
    // `this.server.to(chatId.toString()).emit('message.create', { message: messageToSend, updatedChat: updatedChatForFrontend });`
    // Bu halda `socket.on` handler-i `(payload: { message: ChatMessage; updatedChat?: Chat })` olmalıdır.
    // Amma loglar fərqli bir quruluş aldığınızı göstərir.

    // Gəlin, backend kodunuza bir daha baxaq. Mən ən son backend kodunuzda
    // `this.server.to(chatId.toString()).emit('message.create', { message: messageToSend, updatedChat: updatedChatForFrontend });`
    // hissəsini vermişdim. Bu kod ilə frontendə belə bir obyekt gəlməlidir:
    // `{ message: ChatMessage_OBJECT, updatedChat: Chat_OBJECT }`

    // Logda isə `useSocket: message.create payload'unda chat ID tapılmadı (message.chat.id yoluyla): {message: 'yyyyy', ...}`
    // yəni, payloadın özü bir ChatMessage-ə oxşayır. Bu bir ziddiyyətdir.
    // Bu o deməkdir ki, ya backend kodunu mən dəyişən kimi tətbiq etmədiniz, ya da log çıxışını səhv oxuyuram.

    // Gəlin backend kodunun bu hissəsini dəqiqləşdirək (socket.gateway.ts)
    // Mesajı emit edən hissə:
    /*
    this.server.to(chatId.toString()).emit('message.create', {
      message: messageToSend,
      updatedChat: updatedChatForFrontend,
    });
    */

    // Əgər backend yuxarıdakı kimi göndərirsə, onda `useSocket.ts` içindəki handler belə olmalıdır:
    socket.on('message.create', (payload: { message: ChatMessage; updatedChat?: Chat }) => {
        // `payload.message.message` undefined gəlirsə, deməli `payload.message` field-i yoxdur
        // və `payload`un özü bir `ChatMessage` imiş.
        // Yox, logdan aydın görünür ki, `payload` bir obyektdir və `message` fieldi var.
        // {message: 'yyyyy', readBy: Array(1), sender: {…}, chat: {…}, id: 98, …}
        // Bu o deməkdir ki, `payload`un özü artıq `ChatMessage`dir.
        // Onda backend kodunda `this.server.to(chatId.toString()).emit('message.create', { message: messageToSend, updatedChat: updatedChatForFrontend });`
        // hissəsi düzgün işləmir və ya başqa bir yerden emit olunur.

        // Ən sadə variant budur ki, `message.create` eventi sadəcə `ChatMessage` obyekti göndərir:
        const receivedMessage: ChatMessage = payload as unknown as ChatMessage; // Tip cast edək
        
        console.log('useSocket: Yeni mesaj alındı (message.create):', receivedMessage.message); // receivedMessage.message ilə mesajı alırıq

        if (receivedMessage && receivedMessage.chat && receivedMessage.chat.id) {
            dispatch(addMessage({ chatId: receivedMessage.chat.id, message: receivedMessage }));
        } else {
            console.error("useSocket: message.create payload'unda chat ID tapılmadı (receivedMessage.chat.id yoluyla):", receivedMessage);
        }
        // `updatedChat` burada yoxdursa, ayrı bir event dinləmək lazımdır, və ya backenddən birlikdə göndərilməlidir.
        // Sizin logda `updatedChat` yoxdur. Sadəcə Chat güncəllənməsi logunu ayrı görmüşdünüz.
    });
    
    // `chat.update` eventini olduğu kimi saxlayırıq, çünki o düzgün işləyir.
    socket.on('chat.update', (chat: Chat) => {
        console.log('useSocket: Chat güncellendi:', chat);
        dispatch(updateChat(chat));
    });

    socket.on('chat.create', (chat: Chat) => {
      console.log('useSocket: Yeni chat yaradıldı:', chat);
      dispatch(addChat(chat));
    });

    socket.on('disconnect', (reason) => {
      console.log('useSocket: Socket.IO ayrıldı:', reason);
      socketRef.current = null;
    });

    socket.on('connect_error', (err) => {
      console.error('useSocket: Socket.IO bağlantı xətası:', err.message);
    });

    return () => {
      if (socketRef.current) {
        console.log('useSocket: Komponent unmount oldu, Socket.IO bağlantısı kəsilir.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, dispatch]);

  return socketRef;
};