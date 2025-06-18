// components/chat/ChatList.tsx
'use client';

import React from 'react';
import { Input, Avatar, Spinner } from '@nextui-org/react';
import { MagnifyingGlassIcon  } from '@heroicons/react/24/outline'; // Outline ikon

import { Chat } from '@/hooks/useChatList';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  onSelectChat: (chatId: number) => void;
  selectedChatId: number | null;
  currentUserId: number; // Cari user ID'si
}

export const ChatList: React.FC<ChatListProps> = ({ chats, loading, error, onSelectChat, selectedChatId, currentUserId }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Çat siyahısı yüklənərkən xəta: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-content1 dark:bg-gray-800 border-r border-default-200 dark:border-gray-700">
      <div className="p-4 border-b border-default-200 dark:border-gray-700">
        <Input
          placeholder="Axtarışa başla və ya yeni çat yarat"
          startContent={<MagnifyingGlassIcon  className="h-5 w-5 text-default-400" />}
          className="w-full"
          variant="faded"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="text-center text-default-500 p-4">
            <p>Hələ heç bir çatınız yoxdur.</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = chat.id === selectedChatId;
            // Fərdi çat üçün digər istifadəçinin profil şəkli və adını tapın
            // Hazırda sizin API cavabınızda fərdi chat üçün "name" null gəlir.
            // Bu halda chatın iştirakçılarını backend-dən almalısınız.
            // Əgər API cavabında fərdi çat üçün `participants` array gəlirsə:
            // const otherParticipant = chat.participants?.find(p => p.id !== currentUserId);
            // const chatDisplayName = chat.isGroup ? chat.name : (otherParticipant?.userName || 'Naməlum İstifadəçi');
            // const chatDisplayAvatar = chat.isGroup ? null : (otherParticipant?.profilePicture || null);

            // Məsələn sizin API cavabınıza görə lastMessage-dən senderi istifadə edək:
            const chatDisplayName = chat.name || (chat.lastMessage?.sender?.userName || 'Naməlum İstifadəçi');
            const chatDisplayAvatar = chat.lastMessage?.sender?.profilePicture || null;


            return (
              <div
                key={chat.id}
                className={`flex items-center p-3 cursor-pointer border-b border-default-100 dark:border-gray-700 hover:bg-default-50 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-primary-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <Avatar
                  src={chatDisplayAvatar || `https://ui-avatars.com/api/?name=${chatDisplayName}&background=random`}
                  size="md"
                  className="mr-3"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg truncate text-foreground dark:text-white">
                      {chatDisplayName}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-default-500 dark:text-default-400 whitespace-nowrap">
                        {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold text-primary dark:text-blue-400' : 'text-default-600 dark:text-default-400'}`}>
                    {chat.lastMessage?.message || "Heç bir mesaj yoxdur."}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-primary text-white rounded-full px-2 py-0.5">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};