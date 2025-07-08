'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';
import axios from 'axios';
import config from '@/config';

// Ortak komponentler
import { SafetyWarning } from '@/components/common/SafetyWarning';
import { WelcomeMessage } from '@/components/common/WelcomeMessage';
import { Footer } from '@/components/Footer';

// Chat komponentleri
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';

// Hooklar ve tipler
import { useChatList, Chat } from '@/hooks/useChatList';
import { useChatMessages, ChatMessage } from '@/hooks/useChatMessages';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSocket } from '@/hooks/useSocket';


export default function HomePage() {
  useSocket();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [sendMessageLoading, setSendMessageLoading] = useState<boolean>(false);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);

  const [showChatWindow, setShowChatWindow] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { user: currentUserProfile, loading: userProfileLoading, error: userProfileError } = useUserProfile({
    enabled: isAuthenticated && !!userToken
  });

  const {
    chats,
    loading: chatListLoading,
    error: chatListError,
    refetch: refetchChatList,
  } = useChatList({ enabled: isAuthenticated && !!userToken });

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
    limit: 20,
  });

  useEffect(() => {
    if (isAuthenticated && chats.length > 0) {
        if (isInitialLoad || window.innerWidth >= 768) {
            if (!selectedChatId) {
                setSelectedChatId(chats[0].id);
                if (window.innerWidth >= 768) {
                    setShowChatWindow(true);
                }
            }
        }
    }
    setIsInitialLoad(false); 
  }, [chats, selectedChatId, isAuthenticated, isInitialLoad]);

  useEffect(() => {
    if (selectedChatId) {
      const foundChat = chats.find(chat => chat.id === selectedChatId);
      setSelectedChat(foundChat || null);
      setShowChatWindow(true); 
    } else {
      setSelectedChat(null);
      setShowChatWindow(false);
    }
  }, [selectedChatId, chats]);


  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setShowChatWindow(true);
  };

  const handleBackToChatList = () => {
    setShowChatWindow(false);
    setSelectedChatId(null);
    setSelectedChat(null);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!isAuthenticated || !userToken) {
      setSendMessageError('İstifadəçi identifikasiyası tələb olunur.');
      alert('İstifadəçi identifikasiyası tələb olunur.');
      return;
    }
    if (!selectedChatId) {
      setSendMessageError('Zəhmət olmasa bir çat seçin.');
      alert('Zəhmət olmasa bir çat seçin.');
      return;
    }
    if (!messageContent.trim()) {
      setSendMessageError('Mesaj boş ola bilməz.');
      alert('Mesaj boş ola bilməz.');
      return;
    }

    setSendMessageLoading(true);
    setSendMessageError(null);
    try {
      const requestUrl = `${config.apiBaseUrl}/chat`;
      const requestPayload = { chatId: selectedChatId, messsage: messageContent };

      console.log('Mesaj göndərilir (page.tsx):');
      console.log('   URL:', requestUrl);
      console.log('   Method:', 'POST');
      console.log('   Payload:', requestPayload);
      console.log('   Authorization Token (ilk 10 simvol):', userToken ? userToken.substring(0, 10) + '...' : 'Yoxdur');

      const response = await axios.post(requestUrl, requestPayload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      
      if (response.data.status) {
        console.log('Mesaj uğurla göndərildi (page.tsx):', response.data);
        refetchMessages();
        refetchChatList();
      } else {
        setSendMessageError(response.data.message || 'Mesaj göndərilərkən xəta baş verdi.');
        console.error('Mesaj göndərilərkən API xətası (page.tsx):', response.data);
      }
    } catch (err) {
      console.error('Mesaj göndərilərkən xəta (page.tsx, try-catch):', err);
      if (axios.isAxiosError(err)) {
        console.error('Axios Error Response (page.tsx):', err.response);
        setSendMessageError(err.response?.data?.message || 'Mesaj göndərilərkən gözlənilməyən xəta baş verdi.');
      } else {
        setSendMessageError('Bilinməyən xəta baş verdi.');
      }
    } finally {
      setSendMessageLoading(false);
    }
  };

  return (
    // **DƏYİŞİKLİK BURADA:** `overflow-hidden` əlavə edildi
    // Bu, səhifənin özünün scrollbarının olmasının qarşısını alır
    <div className="flex flex-col h-screen overflow-hidden"> 
      {/* SafetyWarning komponenti əgər hələ də yoxdursa, onu əlavə edin */}
      {/* Bu komponentin özü də sabit hündürlükdə olmalı və flex-shrink-0 olmalıdır */}
      {/* <SafetyWarning />  */}

      {/* Əsas kontent sahəsi (ChatList və ChatWindow) */}
      {/* Bu div hündürlüyün qalan hissəsini tutur və daxili scroll-u idarə edir */}
      <div className="flex flex-1 overflow-hidden"> 
        {isAuthenticated ? (
          <>
            {/* ChatList üçün */}
            <div className={`w-full md:w-1/3 lg:w-1/4 xl:w-1/5 min-w-[280px] border-r border-default-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-full overflow-y-auto ${showChatWindow ? 'hidden md:flex' : 'flex'}`}>
              <ChatList
                chats={chats}
                loading={chatListLoading}
                error={chatListError}
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChatId}
                currentUserId={currentUserId || 0}
              />
            </div>

            {/* ChatWindow üçün */}
            <div className={`flex-1 flex flex-col h-full bg-content2 dark:bg-gray-900 overflow-y-auto ${selectedChatId === null || (showChatWindow === false && window.innerWidth < 768) ? 'hidden' : 'flex'}`}>
              <ChatWindow
                chat={selectedChat}
                messages={messages}
                loading={messagesLoading || sendMessageLoading}
                error={messagesError || sendMessageError}
                onSendMessage={handleSendMessage}
                hasMoreMessages={hasMoreMessages}
                onLoadMoreMessages={loadMoreMessages}
                onBackToChatList={handleBackToChatList}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-content2 dark:bg-gray-900">
            <WelcomeMessage />
          </div>
        )}
      </div>

      {/* Footer komponenti */}
      {/* Footer-in özü də sabit hündürlükdə olmalı və flex-shrink-0 olmalıdır ki, əsas kontent sahəsinin ölçüsünü dəyişməsin */}
      <Footer />
    </div>
  );
}