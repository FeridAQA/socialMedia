// app/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Bu faylın mövcud olduğunu fərz edirəm
import chatReducer from './chatSlice';
import messagesReducer from './messageSlice'; // Doğru olaraq 'messageSlice' adını istifadə edirik

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatReducer,
    messages: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;