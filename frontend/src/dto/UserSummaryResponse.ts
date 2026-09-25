export interface UserSummaryResponse {
  userName: string;
  email: string;
  balance: number;
  revenue: number;
  expenses: number;
  categories: CategorySummaryResponse[];
  months: MonthlySummaryResponse[];
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
  transactionCount: number;
  byCategory: CategorySummaryResponse[];
  byMonth: MonthlySummaryResponse[];
}

export interface CategorySummaryResponse {
  categoryId: number | null;
  categoryName: string;
  total: number;
}

export interface MonthlySummaryResponse {
  month: string;
  income: number;
  expense: number;
}
