// app/store/index.ts və ya app/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import messageReducer from './messageSlice'; // ← Əlavə et

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatReducer, // ← ad istəyə uyğun dəyişilə bilər
    messages: messageReducer, // ← Ən vacib hissə budur!
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
