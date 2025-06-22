// hooks/useChatList.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { clearToken } from '../app/store/authSlice';
import axios from 'axios';

// Backend'den gələn ProfilePicture tipi
// LastMessage.sender.profilePicture üçün bu tip uyğun gəlir
export interface ProfilePicture {
  id: number;
  url: string;
  // updatedAt, createdAt, filename əgər gəlirsə əlavə edin
}

export interface LastMessage {
  message: string;
  readBy: number[];
  sender: {
    id: number;
    userName: string;
    profilePicture: ProfilePicture | null;
  };
  createdAt: string;
}

// ChatParticipant interfeysini dəyişdiririk
// Backend cavabına görə profilePicture birbaşa URL (string) kimi gəlir
export interface ChatParticipant {
  id: number;
  userName: string;
  profilePicture: string | null; // <--- Tipi dəyişdirildi: indi string | null
}

// Backend'den gelen Chat tipi
export interface Chat {
  id: number;
  isGroup: boolean;
  name: string | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
  everyoneRead: boolean;
  participants: ChatParticipant[];
}

interface UseChatListOptions {
  enabled?: boolean;
}

interface UseChatListResult {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useChatList = (options?: UseChatListOptions): UseChatListResult => {
  const { enabled = true } = options || {};

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  const fetchChatList = useCallback(async () => {
    if (!enabled || !isAuthenticated || !userToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Chat[]>('/chat');
      setChats(response.data);
    } catch (err) {
      console.error('Failed to fetch chat list:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Çat siyahısını yükləyərkən xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken());
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userToken, dispatch]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  return { chats, loading, error, refetch: fetchChatList };
};