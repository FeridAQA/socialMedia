// components/chat/ChatWindow.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chat } from '@/hooks/useChatList';
import { ChatMessage } from '@/hooks/useChatMessages';
import { useSelector, useDispatch } from 'react-redux'; // useDispatch import edin
import { RootState } from '@/app/store';
import { useSocket } from '@/hooks/useSocket';
// addMessage ve updateChat buraya import edilmeyecek, zira useSocket içinde dispatch ediliyor.

interface ChatWindowProps {
  chat: Chat | null;
  loading: boolean;
  error: string | null;
  onSendMessage: (messageContent: string) => void;
  currentUserId: number;
  hasMoreMessages: boolean;
  onLoadMoreMessages: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  loading,
  error,
  onSendMessage,
  currentUserId,
  hasMoreMessages,
  onLoadMoreMessages,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [someoneIsTyping, setSomeoneIsTyping] = useState<null | { userId: number; username: string }>(null);
  const socketRef = useSocket(); // useSocket hook'undan socketRef objesini al
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch(); // useDispatch'i kullanın

  // Redux store'dan mesajları seçiyoruz. Bu, useSocket içindeki addMessage çağrıldığında otomatik güncellenecek.
  const messages = useSelector((state: RootState) => chat?.id ? (state.messages[chat.id] || []) : []);

  // Bu state, scroll'un en aşağıda olub-olmadığını yoxlayacaq
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // **BURADA DƏYİŞİKLİK: Socket event listenerləri yalnız `chat.writing` üçün qalır, `message.create` useSocket-a daşındı**
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !chat) return;

    // Backend'den 'chat.writing' event'ini dinleyin
    const handleWriting = (payload: { userId: number; username: string; status: boolean; chatId: number }) => {
      // Yalnız seçili çat və öz yazma statusumuzu filter et
      if (chat && payload.chatId === chat.id && payload.userId !== currentUserId) {
        if (payload.status) {
          setSomeoneIsTyping({ userId: payload.userId, username: payload.username });
        } else {
          setSomeoneIsTyping(null);
        }
      }
    };

    socket.on('chat.writing', handleWriting);

    return () => {
      socket.off('chat.writing', handleWriting);
    };
  }, [socketRef.current, chat, currentUserId]); // socketRef.current'i dependency olaraq əlavə edin

  // Mesajlar değiştiğinde veya yeni mesaj geldiğinde scroll'u yönet
  useEffect(() => {
    if (chatContainerRef.current && isScrolledToBottom) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isScrolledToBottom]);

  // Scroll olayını dinleyerek kullanıcının manuel scroll edip etmediğini kontrol et
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Kullanıcı en alt kısma 100px mesafeden daha yakınsa, isScrolledToBottom true olsun
      setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      // **BURADA DƏYİŞİKLİK: Yeni chat seçildikdə hər zaman ən aşağıya scroll et**
      chatContainer.scrollTop = chatContainer.scrollHeight; // Başlangıçta en aşağıda olsun
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [chatContainerRef, chat]); // `chat` propunu əlavə edin, chat dəyişdikdə bu useEffect yenidən işləsin

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !chat) return;
    // Sadece kendi ID'mizi ve seçili chat ID'mizi gönder
    socket.emit('writing', { chatId: chat.id, status: true, userId: currentUserId });

    // Bir süre sonra yazmayı durdurma sinyali gönder
    setTimeout(() => {
      if (socket.connected) { // Socket hala bağlıysa gönder
        socket.emit('writing', { chatId: chat.id, status: false, userId: currentUserId });
      }
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput('');
    setIsScrolledToBottom(true); // Mesaj gönderdikten sonra en aşağı scroll et
  };

  if (!chat) return <div className="p-4">Zəhmət olmasa bir çat seçin.</div>;

  return (
    <div className="flex flex-col h-full">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
      >
        {hasMoreMessages && (
          <div className="text-center">
            <button
              className="text-sm text-blue-500 hover:underline mb-2"
              onClick={onLoadMoreMessages}
            >
              Daha çox mesaj yüklə
            </button>
          </div>
        )}
        {/* Mesajları map edərkən sort etməyə ehtiyac yoxdur, çünki store-da artıq düzgün sıra var */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-xl max-w-xs ${msg.sender.id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <div className="text-sm">{msg.sender.userName}</div>
              <div>{msg.message}</div>
              <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {someoneIsTyping && (
          <div className="text-sm text-gray-400 italic">
            {someoneIsTyping.username} yazır...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyUp={handleTyping} // onKeyUp doğru
          placeholder="Mesaj yazın..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
          Göndər
        </button>
      </form>
    </div>
  );
};