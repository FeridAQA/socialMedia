// hooks/useUserPosts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useDispatch, useSelector } from 'react-redux'; // Reduxdan
import { RootState, AppDispatch } from '../app/store';
import { clearToken } from '../app/store/authSlice'; // Tokeni təmizləmək üçün
import axios from 'axios';

// Post tipi backend cavabına uyğun olmalıdır
export interface UserPost {
  id: number;
  imageUrl: string; // Sizdəki URL adı
  caption: string;
  likesCount: number; // Backend-dən gələn adlara uyğunlaşdırın
  commentsCount: number; // Backend-dən gələn adlara uyğunlaşdırın
  createdAt: string;
  // digər sahələr...
}

interface UseUserPostsOptions {
  page?: number;
  limit?: number;
  enabled?: boolean; // Bu hook-un işə düşüb-düşməyəcəyini idarə etmək üçün
}

interface UseUserPostsResult {
  posts: UserPost[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean; // Daha çox post olub-olmadığını göstərir
}

export const useUserPosts = (options?: UseUserPostsOptions): UseUserPostsResult => {
  const { page = 0, limit = 10, enabled = true } = options || {};

  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true); // Başlanğıcda true qoyuruq

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  const fetchPosts = useCallback(async () => {
    if (!enabled || !isAuthenticated) { // Authenticate olunmayıbsa və ya enabled deyilsə fetch etmə
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Backend cavabının strukturuna diqqət edin.
      // Əgər birbaşa post array-i gəlirsə:
      const response = await api.get<UserPost[]>(`/post/user`, {
        params: { page, limit },
      });
      
      const newPosts = response.data; // Tutaq ki, cavab birbaşa array-dir

      setPosts(newPosts);
      // Backend cavabında ümumi say və ya səhifələmə məlumatı olmalıdır
      // Məsələn, response.data.totalPostsCount > (page + 1) * limit
      // Hal-hazırda sadəcə gələn postların sayına əsasən hasMore-u təyin edirik
      setHasMore(newPosts.length === limit); // Əgər limit qədər post gəlibsə, daha çoxu ola bilər

    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Postları yükləyərkən xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken()); // Token etibarsızdırsa, logout edin
          // router.push('/login'); // Yönləndirməni komponent səviyyəsində edin
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      setPosts([]);
      setHasMore(false); // Xəta olarsa, daha çox post olmadığını qəbul edirik
    } finally {
      setLoading(false);
    }
  }, [page, limit, enabled, isAuthenticated, dispatch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts, hasMore };
};