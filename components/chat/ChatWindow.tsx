// components/chat/ChatWindow.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Spinner, Avatar, Input, Button } from '@nextui-org/react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

import { ChatMessage } from '@/hooks/useChatMessages';
import { Chat } from '@/hooks/useChatList'; // Chat tipini de import edin

interface ChatWindowProps {
  chat: Chat | null; // Seçilmiş chat obyekti
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  currentUserId: number; // Cari user ID'si
  hasMoreMessages: boolean;
  onLoadMoreMessages: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  loading,
  error,
  onSendMessage,
  currentUserId,
  hasMoreMessages,
  onLoadMoreMessages,
}) => {
  const [messageInput, setMessageInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null); // Mesajların sonuna scroll etmek için
  const chatWindowRef = useRef<HTMLDivElement>(null); // Scroll event listener için

  // Mesajlar yüklendiğinde otomatik olarak en aşağıya scroll et
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // messages her değiştiğinde scroll et

  // Daha fazla mesaj yüklemek için scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (chatWindowRef.current && chatWindowRef.current.scrollTop === 0 && hasMoreMessages && !loading) {
        onLoadMoreMessages();
      }
    };

    const currentChatWindow = chatWindowRef.current;
    if (currentChatWindow) {
      currentChatWindow.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentChatWindow) {
        currentChatWindow.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMoreMessages, loading, onLoadMoreMessages]);


  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

   if (!chat) { // Əgər heç bir chat seçilməyibsə
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-content1 dark:bg-gray-800 rounded-lg shadow-md">
        {/* <Image
          src="/path/to/whatsapp-like-logo.svg" // Kendi logonuzu buraya yerleştirin
          alt="Welcome"
          width={150}
          height={150}
          className="mb-6 opacity-70"
        /> */}
        <h2 className="text-3xl font-semibold text-foreground dark:text-white mb-4">
          Sohbətlərə Xoş Gəlmisiniz!
        </h2>
        <p className="text-lg text-default-600 dark:text-default-400 max-w-md">
          Başlamaq üçün sol tərəfdəki çatlardan birini seçin.
        </p>
        <p className="mt-4 text-sm text-default-500 dark:text-default-500">
          Mesajlarınız End-to-End şifrələnib.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-content1 dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-default-200 dark:border-gray-700 flex items-center">
        <Avatar
          src={
            chat.isGroup
              ? undefined // Qrup üçün avatar yoxdursa
              : (chat.lastMessage?.sender?.profilePicture || `https://ui-avatars.com/api/?name=${chat.name || 'Group'}&background=random`)
          }
          name={chat.name || (chat.lastMessage?.sender?.userName || 'Naməlum')}
          size="md"
          className="mr-3"
        />
        <h2 className="text-xl font-semibold text-foreground dark:text-white">
          {chat.name || (chat.isGroup ? "Qrup Çatı" : chat.lastMessage?.sender?.userName || "Fərdi Çat")}
        </h2>
      </div>

      <div ref={chatWindowRef} className="flex-1 p-4 overflow-y-auto flex flex-col-reverse"> {/* flex-col-reverse ile mesajları aşağıdan yukarıya diz */}
        {loading && messages.length === 0 && (
          <div className="flex justify-center my-4">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center p-4">
            <p>Mesajlar yüklənərkən xəta: {error}</p>
          </div>
        )}
        {hasMoreMessages && !loading && (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            className="self-center mt-2"
            onClick={onLoadMoreMessages}
          >
            Daha çox mesaj yüklə
          </Button>
        )}

        {messages.slice().reverse().map((msg) => ( // Mesajları ters çevirerek en son mesajı en altta göster
          <div
            key={msg.id}
            className={`flex mb-3 ${msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                msg.sender.id === currentUserId
                  ? 'bg-primary-500 text-white dark:bg-blue-700'
                  : 'bg-default-200 text-foreground dark:bg-default-700 dark:text-white'
              }`}
            >
              {msg.sender.id !== currentUserId && (
                <div className="font-semibold text-sm mb-1">
                  {msg.sender.userName}
                </div>
              )}
              <p className="text-sm break-words">{msg.message}</p>
              <span className="block text-right text-xs mt-1 opacity-80">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Yeni mesajların sonuna scroll etmek için */}
      </div>

      <div className="p-4 border-t border-default-200 dark:border-gray-700 flex items-center gap-2">
        <Input
          placeholder="Mesaj yaz..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          className="flex-1"
          variant="faded"
        />
        <Button isIconOnly color="primary" onPress={handleSend}>
          <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
        </Button>
      </div>
    </div>
  );
};