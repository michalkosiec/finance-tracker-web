export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limitAmount: number;
  currency: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "Income" | "Expense";

export interface Transaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  categoryId: string;
  date: string;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
}

export interface StatsSummaryResponse {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
}

export interface CategoryStatResponse {
  categoryName: string;
  totalExpense: number;
  numberOfTransactions: number;
}

export interface ExpensesByCategoryResponse {
  categoryStats: CategoryStatResponse[];
  currency: string;
}

export interface MonthlyStatResponse {
  month: string;
  totalIncome: number;
  totalExpense: number;
}

export interface MonthlyStatsResponse {
  monthlyStats: MonthlyStatResponse[];
  currency: string;
}
