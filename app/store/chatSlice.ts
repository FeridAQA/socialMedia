// app/store/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat } from '@/hooks/useChatList';

const chatSlice = createSlice({
  name: 'chats',
  initialState: [] as Chat[],
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => action.payload,
    addChat: (state, action: PayloadAction<Chat>) => {
      if (!state.find((c) => c.id === action.payload.id)) {
        state.push(action.payload);
      }
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.findIndex((chat) => chat.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { setChats, addChat, updateChat } = chatSlice.actions;
export default chatSlice.reducer;