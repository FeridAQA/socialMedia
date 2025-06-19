// hooks/useChatMessages.ts
'use client';

import { useEffect, useCallback, useState } from 'react';
import api from '@/services/api'; // API servisi import edilir
import { useSelector, useDispatch } from 'react-redux'; // Redux hook'ları import edilir
import { RootState, AppDispatch } from '../app/store'; // Redux store tipleri import edilir
import { clearToken } from '../app/store/authSlice'; // Autentifikasiya tokenini təmizləmək üçün action
import axios from 'axios'; // Axios xətalarını yoxlamaq üçün
import { setMessages, prependMessages } from '../app/store/messageSlice'; // Mesajları Redux store'a qoymaq üçün action'lar

// Mesajı göndərən şəxsin interfeysi
export interface MessageSender {
  id: number;
  userName: string;
  profilePicture: string | null;
}

// Çat mesajının interfeysi
export interface ChatMessage {
  id: number;
  createdAt: string;
  message: string;
  readBy: number[];
  sender: MessageSender;
  updatedAt?: string;
  // **BURADA DƏYİŞİKLİK:** `chatId` yerinə `chat` obyekti əlavə edildi
  chat: { 
    id: number;
    // Əlavə chat property-ləri də ola bilər (məsələn, name, isGroup), lakin `id` əsasdır
  };
}

// `useChatMessages` hook'unun options interfeysi
interface UseChatMessagesOptions {
  chatId: number | null; // Cari çatın ID-si
  limit?: number; // Bir səhifədə neçə mesaj yüklənəcəyi
  enabled?: boolean; // Hook'un aktiv olub-olmadığı
}

// `useChatMessages` hook'unun qaytardığı nəticə interfeysi
interface UseChatMessagesResult {
  loading: boolean; // Mesajların yüklənmə prosesi
  error: string | null; // Baş verən xəta mesajı
  refetch: () => void; // Mesajları yenidən yükləmək üçün funksiya
  hasMore: boolean; // Daha çox mesajın olub-olmadığı
  loadMore: () => void; // Daha köhnə mesajları yükləmək üçün funksiya
}

export const useChatMessages = (options: UseChatMessagesOptions): UseChatMessagesResult => {
  const { chatId, limit = 10, enabled = true } = options;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Daxili olaraq səhifə nömrəsini saxlayır

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  // Mesajları API-dən çəkmək üçün callback funksiya
  const fetchMessages = useCallback(async (pageNum: number) => {
    // Əgər hook deaktivdirsə, autentifikasiya yoxdursa, token yoxdursa və ya çat ID-si yoxdursa, funksiyanı dayandır
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

      // API-dən gələn mesajları tərs sıralayırıq ki, ən yeni mesaj sonda olsun
      // Backend'den gelen verinin ChatMessage tipine uygun olduğunu ve `chat` objesini içerdiğini varsayıyoruz.
      const fetchedMessages = response.data.reverse(); 

      if (pageNum === 0) {
        // İlk yükləmədə mövcud mesajları əvəz edirik
        dispatch(setMessages({ chatId, messages: fetchedMessages }));
      } else {
        // Daha çox yüklədikdə (köhnə mesajlar) mövcud mesajların əvvəlinə əlavə edirik
        dispatch(prependMessages({ chatId, messages: fetchedMessages }));
      }
      
      // Əgər gələn mesajların sayı limitə bərabərdirsə, daha çox mesaj ola bilər
      setHasMore(fetchedMessages.length === limit); 

    } catch (err) {
      console.error(`Mesajlar yüklənərkən xəta baş verdi (Chat ID: ${chatId}):`, err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Mesajları yükləyərkən naməlum xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken()); // Token etibarsızdırsa, təmizlə
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      // Xəta olarsa, ilk yükləmədə mesajları təmizlə
      if (pageNum === 0) dispatch(setMessages({ chatId, messages: [] })); 
      setHasMore(false); // Xəta olarsa daha çox mesaj olmadığını göstər
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userToken, chatId, limit, dispatch]);

  // `chatId` dəyişdikdə və ya ilk dəfə yüklənəndə mesajları sıfırla və ilk səhifəni yüklə
  useEffect(() => {
    setCurrentPage(0); // Səhifə nömrəsini sıfırla
    setHasMore(true); // Daha çox mesajın ola biləcəyini göstər
    fetchMessages(0); // İlk səhifəni yüklə
  }, [chatId, fetchMessages]);

  // Daha köhnə mesajları yükləmək üçün funksiya
  const loadMore = useCallback(() => {
    if (!loading && hasMore) { // Yükləmə getmirsə və daha çox mesaj varsa
      setCurrentPage((prevPage) => prevPage + 1); // Səhifə nömrəsini artır
    }
  }, [loading, hasMore]);

  // `currentPage` dəyişdikdə (yəni `loadMore` çağırılanda) mesajları yenidən yüklə
  useEffect(() => {
    if (currentPage > 0) { // Yalnız ilk səhifə yükləndikdən sonra işləsin
      fetchMessages(currentPage);
    }
  }, [currentPage, fetchMessages]);

  return {
    loading,
    error,
    refetch: () => fetchMessages(0), // Mesajları sıfırdan yenidən yükləmək üçün
    hasMore,
    loadMore,
  };
};