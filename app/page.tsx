// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';

// Ortak komponentler
import { SafetyWarning } from '@/components/common/SafetyWarning';
import { WelcomeMessage } from '@/components/common/WelcomeMessage';

// Chat komponentleri
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';

// Hooklar ve tipler
import { useChatList, Chat } from '@/hooks/useChatList';
import { useChatMessages, ChatMessage } from '@/hooks/useChatMessages';
import { useUserProfile } from '@/hooks/useUserProfile'; // Cari user ID'si için
import api from '@/services/api';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id); // Redux'tan user ID'si

  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Cari user'ın profilini çekmek için (currentUserId almak için)
  const { user: currentUserProfile, loading: userProfileLoading, error: userProfileError } = useUserProfile({
    enabled: isAuthenticated && !!userToken // Sadece login olunca çek
  });


  // Çat listesini çek
  const {
    chats,
    loading: chatListLoading,
    error: chatListError,
    refetch: refetchChatList,
  } = useChatList({ enabled: isAuthenticated && !!userToken });

  // Seçilen chat'ın mesajlarını çek
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
    hasMore: hasMoreMessages,
    loadMore: loadMoreMessages,
  } = useChatMessages({
    chatId: selectedChatId,
    enabled: isAuthenticated && !!userToken && selectedChatId !== null,
    limit: 20, // Bir seferde çekilecek mesaj sayısı
  });

  // Kullanıcı login değilse yönlendirme yerine ana sayfada WelcomeMessage gösterilsin
  // useEffect(() => {
  //   if (!isAuthenticated && !userToken) {
  //     // router.push('/login'); // Bu satırı yoruma aldık
  //   }
  // }, [isAuthenticated, userToken, router]);

  // Çat listesi yüklendiğinde ve ilk chat varsa, onu seç
  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  // selectedChatId değiştiğinde veya chats listesi güncellendiğinde selectedChat'ı bul
  useEffect(() => {
    if (selectedChatId) {
      const foundChat = chats.find(chat => chat.id === selectedChatId);
      setSelectedChat(foundChat || null);
    } else {
      setSelectedChat(null);
    }
  }, [selectedChatId, chats]);


  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    // Mesajlar hooku chatId değişince otomatik refetch edecektir
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!selectedChatId || !messageContent.trim()) return;

    try {
      // Backend'e mesaj gönderme isteği atın
      // Mesaj gönderme endpoint'inizi kontrol edin, örneğin POST /chat/:chatId/message
      await api.post(`/chat/${selectedChatId}/message`, { message: messageContent });
      refetchMessages(); // Mesajları yeniden çekerek yeni mesajı göster
      refetchChatList(); // Son mesajı güncellemek için chat listesini yeniden çek
    } catch (err) {
      console.error('Failed to send message:', err);
      // Hata yönetimi
    }
  };

  return (
    <div className="flex flex-col flex-1"> {/* flex-1 ile qalan hündürlüyü tutsun */}
      <SafetyWarning /> {/* Her zaman üstte görünen güvenlik uyarısı */}

      <div className="flex flex-1 overflow-hidden"> {/* Burası ana layout */}
        {isAuthenticated ? (
          <>
            {/* Sol taraf: Chat Listesi */}
            <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 min-w-[280px] border-r border-default-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-full">
              <ChatList
                chats={chats}
                loading={chatListLoading}
                error={chatListError}
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChatId}
                currentUserId={currentUserId || 0}
              />
            </div>

            {/* Sağ taraf: Mesajlaşma Penceresi */}
            <div className="flex-1 flex flex-col h-full bg-content2 dark:bg-gray-900">
              <ChatWindow
                chat={selectedChat}
                messages={messages}
                loading={messagesLoading}
                error={messagesError}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId || 0}
                hasMoreMessages={hasMoreMessages}
                onLoadMoreMessages={loadMoreMessages}
              />
            </div>
          </>
        ) : (
          // Login olmayan kullanıcı için: WelcomeMessage tüm alanı kaplasın
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-content2 dark:bg-gray-900">
            <WelcomeMessage />
          </div>
        )}
      </div>
    </div>
  );
}