import type { TransactionPageResponse, TransactionResponse } from "../dto/TransactionResponse";
import type { WalletResponse } from "../dto/UserSummaryResponse";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

function getStoredToken() {
  return localStorage.getItem("token") ?? sessionStorage.getItem("token");
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as {
      message?: string;
      detail?: string;
    };

    return error.message ?? error.detail ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function authenticatedGet<T>(
  path: string,
  token: string,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, fallbackMessage);
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getRecentTransactions(
  limit = 5,
): Promise<TransactionResponse[]> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view recent transactions");
  }

  const wallets = await authenticatedGet<WalletResponse[]>(
    "/api/v1/wallets",
    token,
    "Error while loading the wallets",
  );

  const transactionPages = await Promise.all(
    wallets.map((wallet) =>
      authenticatedGet<TransactionPageResponse>(
        `/api/v1/wallets/${wallet.id}/transactions?page=0&size=${limit}&sort=date,desc`,
        token,
        `Error while loading transactions from ${wallet.name}`,
      ),
    ),
  );

  const transactions: TransactionResponse[] = [];

  for (const page of transactionPages) {
    transactions.push(...page.content);
  }

  transactions.sort((first, second) => {
    const dateComparison = second.date.localeCompare(first.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return second.createdAt.localeCompare(first.createdAt);
  });

  return transactions.slice(0, limit);
}
