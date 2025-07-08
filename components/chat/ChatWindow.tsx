'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chat } from '@/hooks/useChatList';
import { ChatMessage } from '@/hooks/useChatMessages';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useSocket } from '@/hooks/useSocket';
import { useTheme } from 'next-themes';
import { selectMessagesByChatId } from '@/app/store/messageSlice';
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; // Geri düyməsi üçün ikon

interface ChatWindowProps {
  chat: Chat | null;
  loading: boolean;
  error: string | null;
  onSendMessage: (messageContent: string) => void;
  hasMoreMessages: boolean;
  onLoadMoreMessages: () => void;
  onBackToChatList: () => void; // **YENİ PROP**
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  loading,
  error,
  onSendMessage,
  hasMoreMessages,
  onLoadMoreMessages,
  onBackToChatList, // **YENİ PROP QƏBUL EDİLİR**
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [someoneIsTyping, setSomeoneIsTyping] = useState<null | { userId: number; username: string }>(null);
  const socketRef = useSocket();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const messages = useSelector((state: RootState) => selectMessagesByChatId(state, chat?.id || null));
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id || null);

  const prevMessagesLength = useRef(messages.length);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    if (initialLoadRef.current && messages.length > 0) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
      initialLoadRef.current = false;
    } else if (messages.length > prevMessagesLength.current) {
      const isUserAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 200;
      if (isUserAtBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, chat]);

  // Yeni mesaj göndərildikdə həmişə ən aşağıya scroll et
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // messages hər dəfə dəyişəndə scroll et.


  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop } = chatContainerRef.current;

    if (scrollTop < 50 && hasMoreMessages && !loading) {
      onLoadMoreMessages();
    }
  }, [hasMoreMessages, loading, onLoadMoreMessages]);

  useEffect(() => {
    initialLoadRef.current = true;
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      // İlk yükləmədə ən aşağıya scroll etməyi təmin etmək üçün bu sətiri bura əlavə etmirik.
      // Yuxarıdakı `useEffect` artıq bunu idarə edir.
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [chat, handleScroll]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !chat || currentUserId === null) return;

    const handleWriting = (payload: { userId: number; username: string; status: boolean; chatId: number }) => {
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
  }, [socketRef.current, chat, currentUserId]);

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !chat || currentUserId === null) return;
    socket.emit('writing', { chatId: chat.id, status: true, userId: currentUserId });

    setTimeout(() => {
      if (socket.connected) {
        socket.emit('writing', { chatId: chat.id, status: false, userId: currentUserId });
      }
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput('');
    // Mesaj göndərildikdən sonra avtomatik ən aşağıya scroll etmək üçün
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  if (!chat) return <div className="p-4 text-gray-500 dark:text-gray-400">Zəhmət olmasa bir çat seçin.</div>;
  if (currentUserId === null) return <div className="p-4 text-red-500 dark:text-red-400">İstifadəçi ID-si yüklənmədi. Zəhmət olmasa yenidən daxil olun.</div>;

  return (
    // Əsas konteyner: flex-col və h-full (valideynindən tam hündürlük alır)
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Chat Başlığı */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg flex items-center flex-shrink-0">
        {/* Geri düyməsi - yalnız mobil görünüşdə (md breakpointdən kiçikdə) görünəcək */}
        <button 
          onClick={onBackToChatList} 
          className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Geri Qayıt"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{chat.name}</h2>
      </div>

      {/* Mesajların göstərildiyi ərazi */}
      {/* flex-1 ilə qalan bütün boşluğu tutur və overflow-y-auto ilə daxili scroll yaradır */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar"
      >
        {loading && hasMoreMessages && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">Mesajlar yüklənir...</div>
        )}
        {error && (
            <div className="text-center text-red-500 text-sm py-2">Xəta: {error}</div>
        )}
        {!hasMoreMessages && messages.length > 0 && !loading && (
            <div className="text-center text-gray-400 dark:text-gray-500 text-xs py-2">Bütün mesajlar yükləndi.</div>
        )}

        {messages.map((msg: ChatMessage) => {
          let formattedTime = 'Invalid Date';
          try {
            const date = new Date(msg.createdAt);
            if (!isNaN(date.getTime())) {
              formattedTime = date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
            } else {
              console.error("Mesajın createdAt dəyəri səhv formatdadır:", msg.createdAt);
            }
          } catch (e) {
            console.error("Mesajın createdAt dəyərini işləyərkən xəta baş verdi:", msg.createdAt, e);
          }

          const isMyMessage = msg.sender.id === currentUserId;

          return (
            <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative px-4 py-2 rounded-xl max-w-[80%] flex flex-col ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
                   style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                <div className="text-sm font-semibold mb-1">
                  {msg.sender.userName}
                </div>
                <div className="text-base flex items-end justify-between gap-4">
                  <span className="flex-1">{msg.message}</span>
                  <span className="text-xs shrink-0"
                        style={{ color: isMyMessage ? 'rgba(255,255,255,0.7)' : (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)') }}>
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {someoneIsTyping && (
          <div className="text-sm text-gray-400 dark:text-gray-500 italic px-2 py-1">
            {someoneIsTyping.username} yazır...
          </div>
        )}
      </div>

      {/* Mesaj göndərmə forması */}
      {/* **DƏYİŞİKLİK BURADA:** `flex-shrink-0` əlavə edildi */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyUp={handleTyping}
          placeholder="Mesaj yazın..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600"
          disabled={loading && messages.length === 0}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!messageInput.trim() || (loading && messages.length === 0)}
        >
          Göndər
        </button>
      </form>
    </div>
  );
};