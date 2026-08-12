import type {
  TransactionPageResponse,
  TransactionResponse,
} from "../dto/TransactionResponse";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { getErrorMessage, getStoredToken } from "./api";

const API_BASE_URL = "http://localhost:8081";


export async function getRecentTransactions(
  limit = 5,
): Promise<TransactionResponse[]> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view recent transactions");
  }

  const walletsResponse = await fetch(`${API_BASE_URL}/api/v1/wallets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!walletsResponse.ok) {
    const message = await getErrorMessage(
      walletsResponse,
      "Error while loading the wallets",
    );
    throw new Error(message);
  }

  const wallets = (await walletsResponse.json()) as WalletResponse[];
  const transactions: TransactionResponse[] = [];

  for (const wallet of wallets) {
    const transactionsResponse = await fetch(
      `${API_BASE_URL}/api/v1/wallets/${wallet.id}/transactions?page=0&size=${limit}&sort=date,desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!transactionsResponse.ok) {
      const message = await getErrorMessage(
        transactionsResponse,
        `Error while loading transactions from ${wallet.name}`,
      );
      throw new Error(message);
    }

    const page = (await transactionsResponse.json()) as TransactionPageResponse;
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
