// app/store/messageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/hooks/useChatMessages';

interface MessageState {
  [chatId: number]: ChatMessage[];
}

const messageSlice = createSlice({
  name: 'messages',
  initialState: {} as MessageState,
  reducers: {
    setMessages(state, action: PayloadAction<{ chatId: number; messages: ChatMessage[] }>) {
      state[action.payload.chatId] = action.payload.messages;
    },
    addMessage(state, action: PayloadAction<{ chatId: number; message: ChatMessage }>) {
      const chatId = action.payload.chatId;
      if (!state[chatId]) {
        state[chatId] = [];
      }
      state[chatId].push(action.payload.message);
    },
  },
});

export const { setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
