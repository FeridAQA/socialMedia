// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice'; // setCredentials'ı import edin
import type { User } from '../../store/authSlice'; // User tipini de import edin
import config from '../../../config';

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!usernameOrEmail || !password) {
      setError('Zəhmət olmasa bütün sahələri doldurun.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: usernameOrEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Daxilolma uğurlu oldu:', data);
        // Backend'den gelen 'data' objesinin içinde 'token' ve 'user' olduğunu varsayıyoruz
        // user objesi { id: number, userName: string } formatında olmalıdır
        const { token, user } = data; // Bu satır backend'in cevabına göre değişebilir

        if (token && user) {
          dispatch(setCredentials({ token, user: user as User })); // User tipini belirtin
          router.push('/');
        } else {
          setError('Daxilolma uğursuz oldu: Token və ya istifadəçi məlumatı tapılmadı.');
        }
      } else {
        setError(data.message || 'Daxilolma uğursuz oldu. Naməlum xəta.');
      }
    } catch (err) {
      console.error('Daxilolma zamanı xəta:', err);
      setError('Serverlə əlaqə qurularkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Hesabınıza daxil olun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            və ya <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">yeni hesab yaradın</a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username-or-email" className="sr-only">İstifadəçi adı və ya E-poçt</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="username-or-email"
                  name="username-or-email"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pl-10 bg-gray-50 dark:bg-gray-700"
                  placeholder="İstifadəçi adı və ya E-poçt"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifrə</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pl-10 bg-gray-50 dark:bg-gray-700"
                  placeholder="Şifrə"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                onClick={() => router.push('/forgot-password')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
              >
                Şifrəni unutdum?
              </a>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Daxil Ol'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}