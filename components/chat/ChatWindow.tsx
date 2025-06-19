'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chat } from '@/hooks/useChatList';
import { ChatMessage } from '@/hooks/useChatMessages';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useSocket } from '@/hooks/useSocket';

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
  const socketRef = useSocket();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = useSelector((state: RootState) => chat?.id ? (state.messages[chat.id] || []) : []);

  const handleTyping = () => {
    if (!socketRef.current || !chat) return;
    socketRef.current.emit('writing', { chatId: chat.id, status: true });

    setTimeout(() => {
      socketRef.current?.emit('writing', { chatId: chat.id, status: false });
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput('');
  };

  useEffect(() => {
    if (!socketRef.current || !chat) return;

    const handleWriting = (payload: { userId: number; username: string; status: boolean }) => {
      if (payload.status) {
        setSomeoneIsTyping({ userId: payload.userId, username: payload.username });
      } else {
        setSomeoneIsTyping(null);
      }
    };

    socketRef.current.on('chat.writing', handleWriting);

    return () => {
      socketRef.current?.off('chat.writing', handleWriting);
    };
  }, [chat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chat) return <div className="p-4">Zəhmət olmasa bir çat seçin.</div>;

  return (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {hasMoreMessages && (
          <button
            className="text-sm text-blue-500 hover:underline mb-2"
            onClick={onLoadMoreMessages}
          >
            Daha çox mesaj yüklə
          </button>
        )}
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
          onKeyDown={handleTyping}
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
