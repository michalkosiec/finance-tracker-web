import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBudget,
  createCategory,
  createTransaction,
  deleteBudget,
  deleteCategory,
  deleteTransaction,
  getApiErrorMessage,
  getBudgets,
  getByCategory,
  getCategories,
  getMonthly,
  getSummary,
  getTransactions,
} from "../api/financeApi";
import useAuth from "../context/useAuth";
import type { TransactionType } from "../types";

const CATEGORIES_KEY = ["categories"];
const BUDGETS_KEY = ["budgets"];
const TRANSACTIONS_KEY = ["transactions"];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const now = new Date();
  const [currency, setCurrency] = useState("PLN");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [error, setError] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("wallet");
  const [categoryColor, setCategoryColor] = useState("#2f80ed");

  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("1000");
  const [budgetMonth, setBudgetMonth] = useState(currentMonth());

  const [transactionName, setTransactionName] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("Expense");
  const [transactionAmount, setTransactionAmount] = useState("100");
  const [transactionCategoryId, setTransactionCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayDate());

  const categoriesQuery = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: getCategories,
  });

  const budgetsQuery = useQuery({
    queryKey: BUDGETS_KEY,
    queryFn: getBudgets,
  });

  const transactionsQuery = useQuery({
    queryKey: TRANSACTIONS_KEY,
    queryFn: getTransactions,
  });

  const summaryQuery = useQuery({
    queryKey: ["stats", "summary", year, month, currency],
    queryFn: () => getSummary({ year, month, currency }),
  });

  const byCategoryQuery = useQuery({
    queryKey: ["stats", "by-category", year, month, currency],
    queryFn: () => getByCategory({ year, month, currency }),
  });

  const monthlyQuery = useQuery({
    queryKey: ["stats", "monthly", year, currency],
    queryFn: () => getMonthly({ year, currency }),
  });

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      setCategoryName("");
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
        queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
      ]);
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const createBudgetMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: async () => {
      setTransactionName("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
      ]);
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
      ]);
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    await createCategoryMutation.mutateAsync({
      name: categoryName,
      icon: categoryIcon,
      color: categoryColor,
    });
  }

  async function handleCreateBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!budgetCategoryId) {
      setError("Wybierz kategorię dla budżetu.");
      return;
    }

    await createBudgetMutation.mutateAsync({
      categoryId: budgetCategoryId,
      limitAmount: Number(budgetLimit),
      currency: currency.toUpperCase(),
      month: budgetMonth,
    });
  }

  async function handleCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!transactionCategoryId) {
      setError("Wybierz kategorię dla transakcji.");
      return;
    }

    await createTransactionMutation.mutateAsync({
      name: transactionName,
      amount: Number(transactionAmount),
      currency: currency.toUpperCase(),
      categoryId: transactionCategoryId,
      date: transactionDate,
      type: transactionType,
    });
  }

  const isLoadingCore =
    categoriesQuery.isLoading || budgetsQuery.isLoading || transactionsQuery.isLoading;

  return (
    <div className="page dashboard-page">
      <header className="topbar">
        <div>
          <h1>Finance Tracker</h1>
          <p className="muted">Panel oparty o finance-tracker-api</p>
        </div>
        <button type="button" onClick={logout}>
          Wyloguj
        </button>
      </header>

      <section className="card filters">
        <h2>Filtry statystyk</h2>
        <div className="grid grid-3">
          <label>
            Rok
            <input
              type="number"
              min={2000}
              max={2200}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            />
          </label>

          <label>
            Miesiąc
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            />
          </label>

          <label>
            Waluta
            <input
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              maxLength={3}
            />
          </label>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="grid grid-3">
        <article className="card">
          <h2>Podsumowanie</h2>
          {summaryQuery.isLoading && <p>Ładowanie...</p>}
          {summaryQuery.data && (
            <div className="stack compact">
              <p>
                <strong>Miesiąc:</strong> {summaryQuery.data.month}
              </p>
              <p>
                <strong>Przychód:</strong> {summaryQuery.data.totalIncome.toFixed(2)}{" "}
                {summaryQuery.data.currency}
              </p>
              <p>
                <strong>Wydatek:</strong> {summaryQuery.data.totalExpense.toFixed(2)}{" "}
                {summaryQuery.data.currency}
              </p>
              <p>
                <strong>Bilans:</strong> {summaryQuery.data.balance.toFixed(2)}{" "}
                {summaryQuery.data.currency}
              </p>
            </div>
          )}
        </article>

        <article className="card">
          <h2>Wydatki wg kategorii</h2>
          {byCategoryQuery.isLoading && <p>Ładowanie...</p>}
          <ul className="list">
            {(byCategoryQuery.data?.categoryStats ?? []).map((row) => (
              <li key={row.categoryName}>
                <span>{row.categoryName}</span>
                <span>
                  {row.totalExpense.toFixed(2)} {byCategoryQuery.data?.currency}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Rok (miesięcznie)</h2>
          {monthlyQuery.isLoading && <p>Ładowanie...</p>}
          <ul className="list">
            {(monthlyQuery.data?.monthlyStats ?? []).map((row) => (
              <li key={row.month}>
                <span>{row.month}</span>
                <span>
                  +{row.totalIncome.toFixed(0)} / -{row.totalExpense.toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {isLoadingCore ? (
        <p>Ładowanie danych...</p>
      ) : (
        <section className="grid grid-3">
          <article className="card">
            <h2>Kategorie</h2>
            <form onSubmit={handleCreateCategory} className="stack compact">
              <label>
                Nazwa
                <input
                  required
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                />
              </label>
              <label>
                Ikona
                <input
                  required
                  value={categoryIcon}
                  onChange={(event) => setCategoryIcon(event.target.value)}
                />
              </label>
              <label>
                Kolor
                <input
                  required
                  value={categoryColor}
                  onChange={(event) => setCategoryColor(event.target.value)}
                />
              </label>
              <button type="submit" disabled={createCategoryMutation.isPending}>
                Dodaj kategorię
              </button>
            </form>

            <ul className="list">
              {(categoriesQuery.data ?? []).map((category) => (
                <li key={category.id}>
                  <span>
                    {category.name} <small>{category.icon}</small>
                  </span>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Budżety</h2>
            <form onSubmit={handleCreateBudget} className="stack compact">
              <label>
                Kategoria
                <select
                  required
                  value={budgetCategoryId}
                  onChange={(event) => setBudgetCategoryId(event.target.value)}
                >
                  <option value="">Wybierz kategorię</option>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Limit
                <input
                  required
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={budgetLimit}
                  onChange={(event) => setBudgetLimit(event.target.value)}
                />
              </label>
              <label>
                Miesiąc
                <input
                  required
                  type="month"
                  value={budgetMonth}
                  onChange={(event) => setBudgetMonth(event.target.value)}
                />
              </label>
              <button type="submit" disabled={createBudgetMutation.isPending}>
                Dodaj budżet
              </button>
            </form>

            <ul className="list">
              {(budgetsQuery.data ?? []).map((budget) => (
                <li key={budget.id}>
                  <span>
                    {categoryMap.get(budget.categoryId) ?? budget.categoryId}:{" "}
                    {budget.limitAmount.toFixed(2)} {budget.currency} ({budget.month.slice(0, 7)})
                  </span>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteBudgetMutation.mutate(budget.id)}
                    disabled={deleteBudgetMutation.isPending}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Transakcje</h2>
            <form onSubmit={handleCreateTransaction} className="stack compact">
              <label>
                Nazwa
                <input
                  required
                  value={transactionName}
                  onChange={(event) => setTransactionName(event.target.value)}
                />
              </label>
              <label>
                Typ
                <select
                  value={transactionType}
                  onChange={(event) => setTransactionType(event.target.value as TransactionType)}
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </label>
              <label>
                Kategoria
                <select
                  required
                  value={transactionCategoryId}
                  onChange={(event) => setTransactionCategoryId(event.target.value)}
                >
                  <option value="">Wybierz kategorię</option>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kwota
                <input
                  required
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={transactionAmount}
                  onChange={(event) => setTransactionAmount(event.target.value)}
                />
              </label>
              <label>
                Data
                <input
                  required
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                />
              </label>
              <button type="submit" disabled={createTransactionMutation.isPending}>
                Dodaj transakcję
              </button>
            </form>

            <ul className="list">
              {(transactionsQuery.data ?? []).map((transaction) => (
                <li key={transaction.id}>
                  <span>
                    {transaction.name} ({transaction.type}) - {transaction.amount.toFixed(2)}{" "}
                    {transaction.currency} [{categoryMap.get(transaction.categoryId) ?? "brak"}]
                  </span>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                    disabled={deleteTransactionMutation.isPending}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </div>
  );
}
