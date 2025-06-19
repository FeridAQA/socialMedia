// components/chat/ChatWindow.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chat } from '@/hooks/useChatList';
import { ChatMessage } from '@/hooks/useChatMessages'; // ChatMessage tipini import edin
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store'; // RootState import edin
import { useSocket } from '@/hooks/useSocket';
import { useTheme } from 'next-themes'; // next-themes hook'unu import edin
import { selectMessagesByChatId } from '@/app/store/messageSlice'; // Memoizasiyalı selectoru import edin

interface ChatWindowProps {
  chat: Chat | null;
  loading: boolean;
  error: string | null;
  onSendMessage: (messageContent: string) => void;
  // currentUserId propunu buradan çıxarırıq, çünki Redux-dan alınacaq
  hasMoreMessages: boolean;
  onLoadMoreMessages: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  loading,
  error,
  onSendMessage,
  hasMoreMessages,
  onLoadMoreMessages,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [someoneIsTyping, setSomeoneIsTyping] = useState<null | { userId: number; username: string }>(null);
  const socketRef = useSocket();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // Cari temayı alın (light/dark)

  // Redux store'dan mesajları memoizasiyalı selector ilə seçin
  const messages = useSelector((state: RootState) => selectMessagesByChatId(state, chat?.id || null));
  // currentUserId-ni auth slice-dan alın
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id || null);

  const prevMessagesLength = useRef(messages.length); // Əvvəlki mesaj sayını saxlamaq üçün
  const initialLoadRef = useRef(true); // Chat-ın ilk yüklənməsini izləmək üçün

  // Mesajlar dəyişdikdə və ya yeni chat seçildikdə scroll-u idarə et
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    if (initialLoadRef.current && messages.length > 0) {
      // İlk yükləmədə (və ya yeni chat seçiləndə) ən aşağıya scroll et
      chatContainer.scrollTop = chatContainer.scrollHeight;
      initialLoadRef.current = false; // İlk yükləmə tamamlandı
    } else if (messages.length > prevMessagesLength.current) {
      // Yeni mesaj gəldikdə (sayı artdıqda)
      // Əgər istifadəçi mesaj pəncərəsinin dibinə kifayət qədər yaxındırsa (məsələn, 200px içində), avtomatik scroll et
      const isUserAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 200;
      if (isUserAtBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
    prevMessagesLength.current = messages.length; // Mesaj sayını yenilə
  }, [messages, chat]); // `chat` əlavə edildi ki, chat dəyişdikdə bu effekt yenidən işləsin

  // `chat.writing` event listener
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !chat || currentUserId === null) return;

    const handleWriting = (payload: { userId: number; username: string; status: boolean; chatId: number }) => {
      // Yalnız cari chat üçün və başqasının yazma statusunu göstər
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
  }, [socketRef.current, chat, currentUserId]); // `socketRef.current` dependency olaraq əlavə edildi

  // Infinity scroll handler
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop } = chatContainerRef.current;

    // Əgər scroll yuxarıya yaxındırsa (məsələn, ilk 50px içində) və daha çox mesaj varsa və yüklənmə getmirsə
    if (scrollTop < 50 && hasMoreMessages && !loading) {
      onLoadMoreMessages(); // Daha köhnə mesajları yükləmək üçün çağır
    }
  }, [hasMoreMessages, loading, onLoadMoreMessages]); // Dependentlər əlavə edildi

  // Chat dəyişdikdə və ya komponent mount olduqda scroll listener əlavə et
  useEffect(() => {
    initialLoadRef.current = true; // Hər yeni chatda "ilk yükləmə" statusunu reset et
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      // Yeni chat seçiləndə avtomatik ən alta scroll et (bu, yuxarıdakı useEffect ilə birlikdə işləyəcək)
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [chat, handleScroll]); // `chat` propu və `handleScroll` callback'i əlavə edildi

  // Yazma bildirişi (typing indicator) göndərmək üçün
  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !chat || currentUserId === null) return;
    socket.emit('writing', { chatId: chat.id, status: true, userId: currentUserId });

    // 3 saniyə sonra yazma statusunu dayandır
    setTimeout(() => {
      if (socket.connected) { // Socket hələ də bağlıdırsa, statusu sıfırla
        socket.emit('writing', { chatId: chat.id, status: false, userId: currentUserId });
      }
    }, 3000);
  };

  // Mesaj göndərmə formunun submit handler-i
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return; // Boş mesaj göndərmə
    onSendMessage(messageInput); // Parent komponentə mesajı göndərmək üçün callback
    setMessageInput(''); // İnputu təmizlə
    // Mesaj göndərildikdən sonra ən aşağıya scroll et
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  if (!chat) return <div className="p-4 text-gray-500 dark:text-gray-400">Zəhmət olmasa bir çat seçin.</div>;
  // currentUserId yoxdursa, istifadəçinin daxil olmadığını göstər
  if (currentUserId === null) return <div className="p-4 text-red-500 dark:text-red-400">İstifadəçi ID-si yüklənmədi. Zəhmət olmasa yenidən daxil olun.</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Chat Başlığı */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{chat.name}</h2>
      </div>

      {/* Mesajların göstərildiyi ərazi */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar" // Custom scrollbar sinfi
      >
        {/* Yükləmə indikatoru və xəta mesajları */}
        {loading && hasMoreMessages && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">Mesajlar yüklənir...</div>
        )}
        {error && (
            <div className="text-center text-red-500 text-sm py-2">Xəta: {error}</div>
        )}
        {!hasMoreMessages && messages.length > 0 && !loading && (
            <div className="text-center text-gray-400 dark:text-gray-500 text-xs py-2">Bütün mesajlar yükləndi.</div>
        )}

        {/* Mesajların render edilməsi */}
        {messages.map((msg: ChatMessage) => { // msg parametrinə ChatMessage tipini veririk
          let formattedTime = 'Invalid Date';
          try {
            // "Invalid Date" xətasını həll etmək üçün try-catch bloku və format yoxlaması
            // Əmin olun ki, msg.createdAt backenddən ISO 8601 formatında gəlir (məsələn, "2025-06-19T09:00:00.000Z")
            const date = new Date(msg.createdAt);
            if (!isNaN(date.getTime())) { // Tarixin düzgün parse olunduğunu yoxla
              formattedTime = date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
            } else {
              console.error("Mesajın createdAt dəyəri səhv formatdadır:", msg.createdAt);
            }
          } catch (e) {
            console.error("Mesajın createdAt dəyərini işləyərkən xəta baş verdi:", msg.createdAt, e);
          }

          const isMyMessage = msg.sender.id === currentUserId; // Mesajın özümüzə aid olub olmadığını yoxla

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
        {/* Yazma bildirisi */}
        {someoneIsTyping && (
          <div className="text-sm text-gray-400 dark:text-gray-500 italic px-2 py-1">
            {someoneIsTyping.username} yazır...
          </div>
        )}
      </div>

      {/* Mesaj göndərmə forması */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyUp={handleTyping} // Klaviaturada düymə buraxıldıqda yazma statusunu göndər
          placeholder="Mesaj yazın..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600"
          disabled={loading && messages.length === 0} // Yükləmə zamanı inputu deaktiv et
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!messageInput.trim() || (loading && messages.length === 0)} // Boş mesaj və ya yükləmə zamanı düyməni deaktiv et
        >
          Göndər
        </button>
      </form>
    </div>
  );
};