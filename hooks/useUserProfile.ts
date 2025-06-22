// hooks/useUserProfile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api'; // Axios instansiyasını import edin
import { useDispatch, useSelector } from 'react-redux'; // Reduxdan
import { RootState, AppDispatch } from '../app/store'; // Redux store tipləri
import { clearToken } from '../app/store/authSlice'; // Tokeni təmizləmək üçün
import axios from 'axios'; // Axios xətalarını yoxlamaq üçün

export interface ProfilePicture {
  id: number;
  updatedAt: string;
  createdAt: string;
  filename: string;
  url: string; // Şəkilin əsl URL-i buradadır
}

// Backend'dən gələn UserProfile tipini burada təyin edirik
export interface UserProfile {
  id: number;
  updatedAt: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  userName: string;
  email: string;
  bio: string | null;
  followerCount: number;
  followedCount: number;
  isPrivate: boolean;
  birthDate: string;
  gender: string;
  activationToken: string | null;
  activationExpire: string | null;
  roles: string[];
  profilePicture: ProfilePicture  | null; // Avatar URL-i
  postsCount?: number; // Frontenddə əlavə etdiyimiz üçün opsional edək (page.tsx-də hesablanır)
  isFollowing?: boolean; // Opsional edək, yalnız digər profillər üçün
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
  const userToken = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  const fetchUserProfile = useCallback(async () => {
    if (!enabled || !isAuthenticated || !userToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UserProfile>('/user/profile'); // Backend endpointinizə uyğun dəyişin
      setUser(response.data);
    } catch (err) {
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
  }, [enabled, isAuthenticated, userToken, dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { user, loading, error, refetch: fetchUserProfile };
};