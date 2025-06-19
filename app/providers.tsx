// app/providers.tsx
'use client';

import React, { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from 'react-redux';
import { store, AppDispatch } from './store'; // AppDispatch'i import edin
import { setCredentials } from './store/authSlice'; // setCredentials action'ını import edin
import type { User } from './store/authSlice'; // User tipini də import edin

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const dispatch: AppDispatch = store.dispatch;

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user'); // User məlumatını string kimi oxuyun

    if (token && userString) {
      try {
        const user: User = JSON.parse(userString); // User stringini User tipinə parse edin
        dispatch(setCredentials({ token, user })); // setCredentials ilə token və useri yazın
      } catch (e) {
        console.error("Local storage'dan user məlumatı oxunarkən xəta:", e);
        // Hatalı user verisi varsa, tokeni temizle
        store.dispatch({ type: 'auth/clearToken' }); // clearToken actionunu dispatch edin
      }
    } else if (token && !userString) {
      // Token var amma user məlumatı yoxdursa.
      // Bu halda, ya login prosesində user məlumatını da localStorage'a yazmalısınız,
      // ya da burada API zəngi ilə user məlumatını çəkməlisiniz.
      // Hələlik, sadəcə tokeni set edirik ki, `isAuthenticated` true olsun, amma `user` null qala bilər.
      // Bu, `ChatWindow`-da `currentUserId` null xəbərdarlığını yenə verə bilər.
      console.warn("Token tapıldı, lakin user məlumatı local storage'da yoxdur. Zəhmət olmasa API zəngi ilə user məlumatını çəkin.");
      // Alternativ olaraq: dispatch(setToken(token)); // user məlumatı olmadan tokeni set et
    }
  }, []); // Yalnız bir dəfə yüklənəndə işə düşsün

  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <ReduxProvider store={store}>
          {children}
        </ReduxProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}