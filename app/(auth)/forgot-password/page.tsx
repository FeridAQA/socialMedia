// app/(auth)/forgot-password/page.tsx
'use client'; // Bu səhifə client tərəfdə render olunmalıdır

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import config from '../../../config';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email) {
      setError('Zəhmət olmasa e-poçt ünvanınızı daxil edin.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/forget-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Şifrə sıfırlama linki e-poçtunuza göndərildi. Zəhmət olmasa inboxunuzu yoxlayın.');
        setEmail(''); // Formu təmizləyin
        // *** BU HİSSƏDƏKİ setTimeout İLƏ YÖNLƏNDİRMƏ SİLİNDİ ***
        // setTimeout(() => {
        //   router.push('/login');
        // }, 2000);
      } else {
        setError(data.message || 'Şifrə sıfırlanarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } catch (err) {
      console.error('Şifrə sıfırlama zamanı xəta:', err);
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
            Şifrəni Sıfırla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Zəhmət olmasa qeydiyyatdan keçdiyiniz e-poçt ünvanınızı daxil edin.
            Şifrənizi sıfırlamaq üçün sizə bir link göndərəcəyik.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">E-poçt ünvanı</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pl-10 bg-gray-50 dark:bg-gray-700"
                  placeholder="E-poçt ünvanınız"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          )}
          {success && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400 text-center">{success}</p>
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
                'Link Göndər'
              )}
            </button>
          </div>
          <div className="text-center text-sm mt-4">
            <a onClick={() => router.push('/login')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
              Daxil Ol səhifəsinə qayıt
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}