import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "@/common/api/baseApi";
import chatReducer from "@/chat/state/chatSlice";
import analyticsReducer from "@/dashboard/state/analyticsSlice";
import knowledgeReducer from "@/knowledge/state/knowledgeSlice";
import ticketReducer from "@/tickets/state/ticketSlice";
import uiReducer from "@/common/state/slices/uiSlice";
import orgReducer from "@/common/state/slices/orgSlice";
import userReducer from "@/common/state/slices/userSlice";

// Use combineReducers to create a typed root reducer function
const rootReducer = combineReducers({
  ui: uiReducer,
  chat: chatReducer,
  user: userReducer,
  org: orgReducer,
  tickets: ticketReducer,
  knowledge: knowledgeReducer,
  analytics: analyticsReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

// Infer RootState directly from the rootReducer function
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];