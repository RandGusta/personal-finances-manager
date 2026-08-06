import type { TransactionType } from "./TransactionResponse";

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  description?: string;
  date: string;
  categoryId: number | null;
}
