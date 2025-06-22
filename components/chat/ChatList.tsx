// components/chat/ChatList.tsx
'use client';

import React from 'react';
import { Input, Avatar, Spinner } from '@nextui-org/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Yenilənmiş Chat, ChatParticipant tiplerini import edin
import { Chat, ChatParticipant, ProfilePicture } from '@/hooks/useChatList'; 

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  onSelectChat: (chatId: number) => void;
  selectedChatId: number | null;
  currentUserId: number;
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
          startContent={<MagnifyingGlassIcon className="h-5 w-5 text-default-400" />}
          className="w-full"
          variant="faded"
        />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <div className="text-center text-default-500 p-4">
            <p>Hələ heç bir çatınız yoxdur.</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = chat.id === selectedChatId;
            let chatDisplayName: string | null = chat.name;
            let chatDisplayAvatar: string | null = null;

            if (!chat.isGroup) {
              const otherParticipant = chat.participants.find(
                (p) => p.id !== currentUserId
              );
              if (otherParticipant) {
                chatDisplayName = otherParticipant.userName;
                // BURADA DƏYİŞİKLİK: artıq .url lazım deyil, çünki profilePicture stringdir
                chatDisplayAvatar = otherParticipant.profilePicture || null; 
              }
            } else {
              chatDisplayName = chat.name;
              // Qruplar üçün avatarı hələki ui-avatars.com-dan alırıq
              // Əgər qrup avatarı backenddən gəlirsə, onu da bura əlavə etmək lazımdır.
            }

            // Fallback avatar üçün məntiq
            const finalAvatarSrc = chatDisplayAvatar || `https://ui-avatars.com/api/?name=${chatDisplayName || '?'}&background=random`;

            // Last message createdAt üçün düzgün formatlaşdırma
            let formattedTime = '';
            if (chat.lastMessage && chat.lastMessage.createdAt) {
                try {
                    const date = new Date(chat.lastMessage.createdAt);
                    if (!isNaN(date.getTime())) {
                        formattedTime = date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
                    } else {
                        console.warn("Invalid date format for last message:", chat.lastMessage.createdAt);
                    }
                } catch (e) {
                    console.error("Error formatting last message date:", e);
                }
            }

            return (
              <div
                key={chat.id}
                className={`flex items-center p-3 cursor-pointer border-b border-default-100 dark:border-gray-700 hover:bg-default-50 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-primary-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <Avatar
                  src={finalAvatarSrc}
                  alt={`${chatDisplayName || 'User'}'s avatar`}
                  size="md"
                  className="mr-3"
                  color="primary"
                  radius="full"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg truncate text-foreground dark:text-white">
                      {chatDisplayName || 'Naməlum Chat'}
                    </h3>
                    {formattedTime && (
                      <span className="text-xs text-default-500 dark:text-default-400 whitespace-nowrap">
                        {formattedTime}
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