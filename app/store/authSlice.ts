// app/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
}

// Tokeni ilkin olaraq localStorage-dan oxumağa çalışırıq, amma bunu yalnız client-də edirik.
// Server tərəfdə hydration mismatch olmasın deyə ilkin state null olmalıdır.
const getInitialAuthState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return {
      token: token,
      isAuthenticated: !!token,
    };
  }
  return {
    token: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  // initial state serverdə və clientdə fərqli olmamalıdır.
  // Bu səbəbdən, initial state-i əvvəlcə null/false edirik,
  // sonra `providers.tsx`-də `useEffect` ilə client tərəfdə yükləyirik.
  initialState: {
    token: null,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      // Tokeni localStorage'a yazırıq
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('token', action.payload);
        } else {
          localStorage.removeItem('token');
        }
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      // localStorage'dan tokeni silirik
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;

export default authSlice.reducer;