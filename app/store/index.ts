// app/store/index.ts (or app/store/store.ts)
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // authSlice'ı import edin

export const store = configureStore({
  reducer: {
    auth: authReducer, // authSlice'ı reducer'lara əlavə edin
    // buraya digər reducer'larınızı da əlavə edə bilərsiniz
  },
});

// RootState tipini bütün Redux state-inin tipini təyin etmək üçün istifadə edin
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch tipini dispatch funksiyasının tipini təyin etmək üçün istifadə edin
export type AppDispatch = typeof store.dispatch;