// app/providers.tsx
'use client';

import React, { useEffect } from "react";
// *** CHANGE THIS LINE ***
import { NextUIProvider } from "@nextui-org/react"; // <--- Import from the official NextUI package

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { setToken } from './store/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(setToken(token));
    }
  }, []);

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