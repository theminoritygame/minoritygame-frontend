import { configureStore } from "@reduxjs/toolkit";

import pendingTransactionsReducer from "./slices/pending-txns-slice";
import messagesReducer from "./slices/messages-slice";
import gameInfoReducer from './slices/game-slice';
import appInfoReducer from "./slices/app-slice";

const store = configureStore({
    reducer: {
        pendingTransactions: pendingTransactionsReducer,
        messages: messagesReducer,
        gameInfo: gameInfoReducer,
        appInfo: appInfoReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
