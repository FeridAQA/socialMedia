// src/hooks/useUserPosts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api'; // Axios instansiyasını import edin
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store'; // Doğru yolu qeyd edin (məsələn, 'src/app/store')
import { clearToken } from '../app/store/authSlice';
import axios from 'axios';

export interface PostImage {
  id: number;
  updatedAt: string;
  createdAt: string;
  filename: string;
  url: string;
}

export interface UserPost {
  id: number;
  updatedAt: string;
  createdAt: string;
  description: string;
  likes: any[];
  images: PostImage[];
}

interface UseUserPostsOptions {
  userId: string; // userId burada mütləqdir
  page?: number;
  limit?: number;
  enabled?: boolean;
  // Gizli profil məntiqi üçün əlavə parametrlər
  isPrivate?: boolean;
  followStatus?: 'following' | 'not-following' | 'waiting' | 'self';
}

interface UseUserPostsResult {
  posts: UserPost[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
}

export const useUserPosts = (options: UseUserPostsOptions): UseUserPostsResult => {
  const { userId, page = 0, limit = 10, enabled = true, isPrivate, followStatus } = options;

  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  const fetchUserPosts = useCallback(async () => {
    // İlkin yoxlamalar
    if (!enabled || !isAuthenticated || !userToken || !userId) {
      setLoading(false);
      return;
    }

    // GİZLİ PROFİL MƏNTİQİ: Əgər profil gizlidirsə və istifadəçi izləmirsə
    if (isPrivate && followStatus !== 'following' && followStatus !== 'self') {
      setLoading(false);
      setPosts([]); // Postları təmizlə
      setError("This account is private. Follow to see their photos and videos.");
      setHasMore(false); // Daha çox post yoxdur
      return;
    }

    if (page > 0 && !hasMore) { // Daha çox post yoxdursa və ilk səhifə deyilsə yükləmə
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Axios ilə API çağırışı
      const response = await api.get<UserPost[]>(`/post/user/${userId}`, {
        params: { page, limit },
        // Headers API instansiyasında təyin oluna bilər, amma əmin olmaq üçün burda da ola bilər.
        // API instansiyanız tokeni avtomatik əlavə edirsə, bu lazım deyil:
        // headers: { 'Authorization': `Bearer ${userToken}` }
      });

      const newPosts = response.data;
      
      // Infinite scroll üçün əvvəlki postları qoruyun
      setPosts((prevPosts) => (page === 0 ? newPosts : [...prevPosts, ...newPosts]));
      setHasMore(newPosts.length === limit);

    } catch (err: any) { // 'any' yerinə 'AxiosError' istifadə etmək daha yaxşıdır
      console.error('Failed to fetch user posts:', err);
      if (axios.isAxiosError(err)) {
        // GİZLİ PROFİL MƏNTİQİ: Backend 403 Forbidden qaytarırsa xüsusi mesajı göstər
        if (err.response?.status === 403) {
            setError("This account is private. Follow to see their photos and videos.");
        } else {
            setError(err.response?.data?.message || 'Postları yükləyərkən xəta baş verdi.');
        }
        
        if (err.response?.status === 401) {
          dispatch(clearToken());
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [userId, page, limit, enabled, isAuthenticated, userToken, isPrivate, followStatus, hasMore, dispatch]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  useEffect(() => {
    // userId, isPrivate, followStatus dəyişəndə state-i sıfırla
    setPosts([]);
    setHasMore(true);
    setLoading(true);
    setError(null);
  }, [userId, isPrivate, followStatus]); // Yeni asılılıqlar əlavə edildi

  return { posts, loading, error, refetch: fetchUserPosts, hasMore };
};