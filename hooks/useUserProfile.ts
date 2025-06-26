// src/hooks/useUserProfile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store'; // Doğru yolu qeyd edin
import { clearToken } from '../app/store/authSlice';
import axios from 'axios';

export interface ProfilePicture {
  id: number;
  updatedAt: string;
  createdAt: string;
  filename: string;
  url: string;
}

export interface UserProfile {
  id: number;
  updatedAt?: string;
  createdAt?: string;
  firstName: string | null;
  lastName: string | null;
  userName: string;
  email?: string;
  bio: string | null;
  followerCount: number;
  followedCount: number;
  isPrivate: boolean;
  birthDate: string;
  gender?: string;
  activationToken?: string | null;
  activationExpire?: string | null;
  roles?: string[];
  profilePicture: ProfilePicture  | null;
  postsCount?: number;
  // followStatus tipini dəqiqləşdiririk ki, 'self' də ola bilsin
  followStatus?: 'following' | 'not-following' | 'waiting' | 'self';
}

interface UseUserProfileOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseUserProfileResult {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserProfile = (options?: UseUserProfileOptions): UseUserProfileResult => {
  const { userId, enabled = true } = options || {};

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const currentAuthUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const fetchUserProfile = useCallback(async () => {
    if (!enabled || !isAuthenticated || !userToken || (userId && userId === '')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url: string;
      if (userId) {
        url = `/user/profile/${userId}`;
      } else {
        url = `/user/profile`;
      }
      
      const response = await api.get<UserProfile>(url);
      
      let fetchedUser = response.data;

      // ÖZ PROFİLİ üçn followStatus-u 'self' olaraq təyin etmə
      if (currentAuthUser && fetchedUser.id === currentAuthUser.id) {
        // Backend 'self' qaytarmırsa və bu öz profilimizdirsə, 'self' təyin edirik.
        // Əgər backend 'following' qaytarırsa, bu istifadəçinin özünü izləməsi kimi anlaşılır.
        // Bu hissə backend-in necə qurulmasından asılıdır. Ən dəqiq variant 'self' olmalıdır.
        fetchedUser.followStatus = 'self'; 
      }

      setUser(fetchedUser);

    } catch (err: any) { // AxiosError tipini yoxlamaq daha məqsədəuyğundur
      console.error('Failed to fetch user profile:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Profil məlumatlarını yükləyərkən xəta baş verdi.');
        if (err.response?.status === 401) {
          dispatch(clearToken());
        }
      } else {
        setError('Bilinməyən xəta baş verdi.');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, userToken, userId, currentAuthUser, dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    setUser(null);
    setLoading(true);
    setError(null);
  }, [userId]);

  return { user, loading, error, refetch: fetchUserProfile };
};