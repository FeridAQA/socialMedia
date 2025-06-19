// app/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// İstifadəçi məlumatları üçün interfeys
export interface User { // User interfeysini export edirik ki, başqa yerlərdə də istifadə edilsin
  id: number;
  userName: string; // Sizdə userName kimi gəlir
  // Əlavə user property-ləri ola bilər (məsələn, email, profilePicture)
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null; // İstifadəçi məlumatlarını saxlayırıq
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: null, // İlk olaraq user məlumatı yoxdur
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Yeni reducer: həm tokeni, həm də user məlumatını qeyd edəcək
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user; // User məlumatını burada yazırıq
      
      // Tokeni və user məlumatını localStorage'a yazırıq
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user)); // User obyektini stringify edərək saxlayırıq
      }
    },
    // Yalnız tokeni yeniləmək üçün (əgər refresh token mexanizmi varsa və ya yalnız tokeni yeniləmək lazımdırsa)
    setToken: (state, action: PayloadAction<string | null>) => {
        state.token = action.payload;
        state.isAuthenticated = !!action.payload;
        // Əgər yalnız token yenilənirsə, user məlumatı dəyişməz
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
      state.user = null; // Token silinəndə user məlumatını da silirik
      
      // localStorage'dan tokeni və user məlumatını silirik
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    // İstifadəçi məlumatlarını ayrıca yeniləmək üçün (məsələn, profil yenilənməsi)
    setUser: (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        if (typeof window !== 'undefined' && action.payload) {
            localStorage.setItem('user', JSON.stringify(action.payload));
        } else if (typeof window !== 'undefined' && !action.payload) {
            localStorage.removeItem('user');
        }
    },
  },
});

export const { setCredentials, setToken, clearToken, setUser } = authSlice.actions;

export default authSlice.reducer;