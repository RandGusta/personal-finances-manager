import type { TransactionPageResponse } from "../dto/TransactionResponse";
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

export async function getTransactionWallets(): Promise<WalletResponse[]> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view transactions");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/wallets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Error while loading the wallets");
    throw new Error(message);
  }

  const wallets = (await response.json()) as WalletResponse[];
  return wallets;
}

export async function getTransactionsPage(
  walletId: number,
  page: number,
  size: number,
): Promise<TransactionPageResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view transactions");
  }

  const query = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: "date,desc",
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallets/${walletId}/transactions?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while loading the transactions",
    );
    throw new Error(message);
  }

  const transactions = (await response.json()) as TransactionPageResponse;
  return transactions;
}
