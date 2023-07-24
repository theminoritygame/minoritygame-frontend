import { IPendingTxn } from "./pending-txns-slice";
import { MessagesState } from "./messages-slice";

export interface IReduxState {
    pendingTransactions: IPendingTxn[];
    messages: MessagesState;
}