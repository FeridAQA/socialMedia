// app/store/messageSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit'; // createSelector'ı import edin
import { ChatMessage } from '@/hooks/useChatMessages';
import { RootState } from '@/app/store'; // RootState'i import edin

interface MessageState {
  [chatId: number]: ChatMessage[];
}

const messageSlice = createSlice({
  name: 'messages',
  initialState: {} as MessageState,
  reducers: {
    setMessages(state, action: PayloadAction<{ chatId: number; messages: ChatMessage[] }>) {
      // Bu metod çatı ilk dəfə yükləyəndə və ya yeniləyəndə istifadə olunur
      state[action.payload.chatId] = action.payload.messages;
    },
    addMessage(state, action: PayloadAction<{ chatId: number; message: ChatMessage }>) {
      const { chatId, message } = action.payload;
      if (!state[chatId]) {
        state[chatId] = [];
      }
      // Mesajın artıq əlavə olunub-olunmadığını yoxlayın (dublikatların qarşısını almaq üçün)
      const messageExists = state[chatId].some(msg => msg.id === message.id);
      if (!messageExists) {
        state[chatId].push(message); // Yeni mesajı sona əlavə edin
      } else {
        console.warn(`Duplicate message received for chat ${chatId}: ID ${message.id}`);
      }
    },
    // Yeni reducer: Daha köhnə mesajları mövcud mesajların əvvəlinə əlavə edir
    prependMessages(state, action: PayloadAction<{ chatId: number; messages: ChatMessage[] }>) {
        const { chatId, messages } = action.payload;
        if (state[chatId]) {
            // Yalnız unikal mesajları əlavə edin
            const existingMessageIds = new Set(state[chatId].map(msg => msg.id));
            const uniqueNewMessages = messages.filter(msg => !existingMessageIds.has(msg.id));
            state[chatId] = [...uniqueNewMessages, ...state[chatId]]; // Yeni mesajları əvvələ əlavə edin
        } else {
            state[chatId] = messages;
        }
    },
    // Müəyyən bir chatın mesajlarını təmizləmək üçün reducer
    clearMessages: (state, action: PayloadAction<number>) => {
      delete state[action.payload];
    },
  },
});

export const { setMessages, addMessage, prependMessages } = messageSlice.actions;
export default messageSlice.reducer;

// Memoizasiyalı selector yaratmaq və onu ixrac etmək
export const selectMessagesByChatId = createSelector(
  (state: RootState) => state.messages, // Bütün mesajlar state'i
  (state: RootState, chatId: number | null) => chatId, // chat.id parametri
  (messagesState, chatId) => {
    if (chatId === null) {
      return [];
    }
    return messagesState[chatId] || [];
  }
);