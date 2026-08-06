export interface UserSummaryResponse {
  userName: string;
  email: string;
  balance: number;
  revenue: number;
  expenses: number;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  role: string;
  memberCount: number;
}

export interface FinancialSummaryResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
