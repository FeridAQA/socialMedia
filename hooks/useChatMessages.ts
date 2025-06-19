// hooks/useChatMessages.ts
'use client';

import { useEffect, useCallback, useState } from 'react';
import api from '@/services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { clearToken } from '../app/store/authSlice';
import axios from 'axios';
import { setMessages } from '../app/store/messageSlice';

export interface MessageSender {
  id: number;
  userName: string;
  profilePicture: string | null;
}

export interface ChatMessage {
  id: number;
  createdAt: string;
  message: string;
  readBy: number[];
  sender: MessageSender;
  updatedAt?: string;
}

interface UseChatMessagesOptions {
  chatId: number | null;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface UseChatMessagesResult {
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

export const useChatMessages = (options: UseChatMessagesOptions): UseChatMessagesResult => {
  const { chatId, page = 0, limit = 10, enabled = true } = options;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
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
      dispatch(setMessages({ chatId, messages: newMessages }));
      setHasMore(newMessages.length === limit);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken());
        }
      } else {
        setError('Bilinməyən xəta.');
      }
      dispatch(setMessages({ chatId, messages: [] }));
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userToken, chatId, limit, dispatch]);

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchMessages(0);
  }, [chatId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (currentPage > 0) {
      fetchMessages(currentPage);
    }
  }, [currentPage, fetchMessages]);

  return {
    loading,
    error,
    refetch: () => fetchMessages(0),
    hasMore,
    loadMore,
  };
};
