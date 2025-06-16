// hooks/useUserProfile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api'; // Axios instansiyasını import edin
import { useDispatch, useSelector } from 'react-redux'; // Reduxdan
import { RootState, AppDispatch } from '../app/store'; // Redux store tipləri
import { clearToken } from '../app/store/authSlice'; // Tokeni təmizləmək üçün
import axios from 'axios'; // Axios xətalarını yoxlamaq üçün

// Backend'dən gələn UserProfile tipini burada təyin edirik
export interface UserProfile {
  id: number;
  updatedAt: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  userName: string;
  email: string;
  // password?: string; // Təhlükəsizlik üçün frontenda gətirməyin
  bio: string | null;
  followerCount: number;
  followedCount: number;
  isPrivate: boolean;
  birthDate: string;
  gender: string;
  activationToken: string | null;
  activationExpire: string | null;
  roles: string[];
  profilePicture: string | null; // Avatar URL-i
  postsCount?: number; // Frontenddə əlavə etdiyimiz üçün opsional edək
  isFollowing?: boolean; // Opsional edək, yalnız digər profillər üçün
}

// Post tipi - Backend cavabına uyğun olmalıdır
export interface UserPost {
  id: number;
  imageUrl: string; // Sizdəki URL adı - Məsələn, "photoUrl" ola bilər backend-də
  caption: string;
  likesCount: number; // Backend-dən gələn adlara uyğunlaşdırın (məsələn, "likes" ola bilər)
  commentsCount: number; // Backend-dən gələn adlara uyğunlaşdırın (məsələn, "comments" ola bilər)
  createdAt: string;
  // Post-a aid digər sahələr, məsələn, userId, vs.
  // user: UserProfile; // Əgər postun içində user obyekti gəlirsə
}

// --- useUserProfile Hooku ---
interface UseUserProfileOptions {
  enabled?: boolean; // Bu hook-un işə düşüb-düşməyəcəyini idarə etmək üçün
}

interface UseUserProfileResult {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserProfile = (options?: UseUserProfileOptions): UseUserProfileResult => {
  const { enabled = true } = options || {};

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token); // Tokeni yoxlayaq ki, sorğu ataq
  const dispatch = useDispatch<AppDispatch>();

  const fetchUserProfile = useCallback(async () => {
    if (!enabled || !isAuthenticated || !userToken) { // Token yoxdursa və ya enabled deyilsə fetch etmə
      setLoading(false); // Yüklənməni dayandır
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Backend-dən userin öz məlumatlarını gətirmək üçün `/user/me` endpointini istifadə edirik.
      // Sizin backendinizdə bu endpointin olduğundan əmin olun.
      const response = await api.get<UserProfile>('/user/profile'); // Dəyişdirin: `/user/me` və ya `/profile`
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Profil məlumatlarını yükləyərkən xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken()); // Token etibarsızdırsa, logout edin
          // Yönləndirməni `app/profile/page.tsx` komponentində edin
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userToken, dispatch]); // userToken və dispatch dependency olaraq əlavə edildi

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // fetchUserProfile dəyişdikdə yenidən işə düşür

  return { user, loading, error, refetch: fetchUserProfile };
};


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
  const [hasMore, setHasMore] = useState<boolean>(true); // Başlanğıcda true qoyuruq

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token); // Tokeni yoxlayaq ki, sorğu ataq
  const dispatch = useDispatch<AppDispatch>();

  const fetchPosts = useCallback(async () => {
    if (!enabled || !isAuthenticated || !userToken) { // Authenticate olunmayıbsa və ya enabled deyilsə fetch etmə
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Sizin `/post/user?page=0&limit=10` endpointinizə sorğu atılır.
      const response = await api.get<UserPost[]>(`/post/user`, { // Dəyişdirin: cavab array şəklində gəlirsə `UserPost[]`
        params: { page, limit },
      });

      const newPosts = response.data; // Tutaq ki, cavab birbaşa post array-idir
      setPosts(newPosts);

      // Backend cavabında ümumi say və ya səhifələmə məlumatı olmalıdır
      // Məsələn, əgər backend `total` və `data` qaytarırsa:
      // const { data: newPosts, total } = response.data;
      // setPosts(newPosts);
      // setHasMore(posts.length + newPosts.length < total); // Əgər daha çox varsa
      
      // Hal-hazırda sadəcə gələn postların sayına əsasən hasMore-u təyin edirik
      // Əgər gələn postların sayı limitdən azdırsa, daha çox post yoxdur deməkdir.
      setHasMore(newPosts.length === limit); 

    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Postları yükləyərkən xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken()); // Token etibarsızdırsa, logout edin
          // Yönləndirməni `app/profile/page.tsx` komponentində edin
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      setPosts([]); // Xəta olarsa postları təmizlə
      setHasMore(false); // Xəta olarsa, daha çox post olmadığını qəbul edirik
    } finally {
      setLoading(false);
    }
  }, [page, limit, enabled, isAuthenticated, userToken, dispatch]); // userToken və dispatch dependency olaraq əlavə edildi

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // fetchPosts funksiyası dəyişdikdə yenidən işə düşür

  return { posts, loading, error, refetch: fetchPosts, hasMore };
};