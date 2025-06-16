// app/providers.tsx
'use client';

import React, { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react"; // Use @nextui-org/react for NextUIProvider
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { setToken } from './store/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Client tərəfdə yükləndikdə localStorage-dan tokeni oxuyub Redux-a yükləyin
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(setToken(token));
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