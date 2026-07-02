import type { AxiosError } from "axios";
import apiClient from "./client";
import type {
  Budget,
  Category,
  ExpensesByCategoryResponse,
  LoginPayload,
  LoginResponse,
  MonthlyStatsResponse,
  RegisterPayload,
  RegisterResponse,
  StatsSummaryResponse,
  Transaction,
} from "../types";

export function getApiErrorMessage(error: unknown): string {
  const fallback = "Wystąpił nieoczekiwany błąd.";
  const maybeAxiosError = error as AxiosError<{
    detail?: string;
    title?: string;
    message?: string;
    errors?: Record<string, string[]>;
  }>;

  const payload = maybeAxiosError?.response?.data;
  if (!payload) {
    return fallback;
  }

  if (payload.detail) {
    return payload.detail;
  }

  if (payload.message) {
    return payload.message;
  }

  const firstValidationError = payload.errors
    ? Object.values(payload.errors).flat().at(0)
    : undefined;
  if (firstValidationError) {
    return firstValidationError;
  }

  return payload.title ?? fallback;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/auth/register", payload);
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(payload: {
  name: string;
  icon: string;
  color: string;
}): Promise<Category> {
  const response = await apiClient.post<Category>("/categories", payload);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function getBudgets(): Promise<Budget[]> {
  const response = await apiClient.get<Budget[]>("/budgets");
  return response.data;
}

export async function createBudget(payload: {
  categoryId: string;
  limitAmount: number;
  currency: string;
  month: string;
}): Promise<Budget> {
  const response = await apiClient.post<Budget>("/budgets", payload);
  return response.data;
}

export async function deleteBudget(id: string): Promise<void> {
  await apiClient.delete(`/budgets/${id}`);
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<Transaction[]>("/transactions");
  return response.data;
}

export async function createTransaction(payload: {
  name: string;
  amount: number;
  currency: string;
  categoryId: string;
  date: string;
  type: "Income" | "Expense";
}): Promise<Transaction> {
  const response = await apiClient.post<Transaction>("/transactions", payload);
  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}

export async function getSummary(params: {
  year: number;
  month: number;
  currency: string;
}): Promise<StatsSummaryResponse> {
  const response = await apiClient.get<StatsSummaryResponse>("/stats/summary", { params });
  return response.data;
}

export async function getByCategory(params: {
  year: number;
  month: number;
  currency: string;
}): Promise<ExpensesByCategoryResponse> {
  const response = await apiClient.get<ExpensesByCategoryResponse>("/stats/by-category", { params });
  return response.data;
}

export async function getMonthly(params: {
  year: number;
  currency: string;
}): Promise<MonthlyStatsResponse> {
  const response = await apiClient.get<MonthlyStatsResponse>("/stats/monthly", { params });
  return response.data;
}
