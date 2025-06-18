// hooks/useUserPosts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api'; // Axios instansiyasını import edin
import { useDispatch, useSelector } from 'react-redux'; // Reduxdan
import { RootState, AppDispatch } from '../app/store'; // Redux store tipləri
import { clearToken } from '../app/store/authSlice'; // Tokeni təmizləmək üçün
import axios from 'axios'; // Axios xətalarını yoxlamaq üçün

// Backend'dən gələn Image obyekti üçün interfeys
export interface PostImage {
  id: number;
  updatedAt: string;
  createdAt: string;
  filename: string;
  url: string; // Şəklin URL-i
}

// Backend'dən gələn UserPost tipini dəqiqləşdiririk
export interface UserPost {
  id: number;
  updatedAt: string;
  createdAt: string;
  description: string; // API-dan `description` olaraq gəlir, `caption` yerinə
  likes: any[]; // API-dan `likes` array-i olaraq gəlir (içindəkilər dəqiqləşdirilə bilər)
  images: PostImage[]; // `images` array-i, hər birində URL var
  // comments?: any[]; // Əgər post cavabında comments array-i gəlirsə, bura əlavə edin
}

// --- useUserPosts Hooku ---
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
  const [hasMore, setHasMore] = useState<boolean>(true);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token); // Tokeni də yoxlayırıq
  const dispatch = useDispatch<AppDispatch>();

  const fetchPosts = useCallback(async () => {
    if (!enabled || !isAuthenticated || !userToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UserPost[]>(`/post/user`, {
        params: { page, limit },
      });

      const newPosts = response.data;
      setPosts(newPosts);
      setHasMore(newPosts.length === limit);

    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Postları yükləyərkən xəta baş verdi.');
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
  }, [page, limit, enabled, isAuthenticated, userToken, dispatch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts, hasMore };
};