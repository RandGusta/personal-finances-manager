export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionResponse {
  id: number;
  walletId: number;
  categoryId: number | null;
  categoryName: string | null;
  createdById: number;
  createdByName: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
}

export interface TransactionPageResponse {
  content: TransactionResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
