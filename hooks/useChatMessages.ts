// hooks/useChatMessages.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { clearToken } from '../app/store/authSlice';
import axios from 'axios';

// Backend'den gelen Sender tipi (mesaj gönderen)
export interface MessageSender {
  id: number;
  userName: string;
  profilePicture: string | null;
}

// Backend'den gelen Message tipi
export interface ChatMessage {
  id: number;
  createdAt: string;
  message: string;
  readBy: number[];
  sender: MessageSender;
  updatedAt?: string;
}

interface UseChatMessagesOptions {
  chatId: number | null; // Hangi chatın mesajlarını çekeceğimizi belirler
  page?: number;
  limit?: number;
  enabled?: boolean; // Bu hook-un işe düşüp düşmeyeceğini kontrol eder
}

interface UseChatMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void; // Daha fazla mesaj yüklemek için
}

export const useChatMessages = (options: UseChatMessagesOptions): UseChatMessagesResult => {
  const { chatId, page = 0, limit = 10, enabled = true } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(page);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  const fetchMessages = useCallback(async (pageNum: number) => {
    if (!enabled || !isAuthenticated || !userToken || chatId === null) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ChatMessage[]>(`/chat/${chatId}`, {
        params: { page: pageNum, limit },
      });

      const newMessages = response.data;
      if (pageNum === 0) {
        setMessages(newMessages); // İlk yükleme veya refetch
      } else {
        setMessages((prevMessages) => [...prevMessages, ...newMessages]); // Daha fazla yükle
      }
      setHasMore(newMessages.length === limit);

    } catch (err) {
      console.error(`Failed to fetch messages for chat ${chatId}:`, err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Mesajları yükləyərkən xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken());
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      if (pageNum === 0) setMessages([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userToken, chatId, limit, dispatch]);

  useEffect(() => {
    setCurrentPage(0); // Chat ID değiştiğinde veya ilk yüklendiğinde sayfayı sıfırla
    setMessages([]); // Mesajları sıfırla
    setHasMore(true); // HasMore'u tekrar true yap
    fetchMessages(0); // İlk sayfayı çek
  }, [chatId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore]);

  // Sayfa numarası değiştiğinde daha fazla mesaj çek
  useEffect(() => {
    if (currentPage > 0) {
      fetchMessages(currentPage);
    }
  }, [currentPage, fetchMessages]);


  return { messages, loading, error, refetch: () => fetchMessages(0), hasMore, loadMore };
};