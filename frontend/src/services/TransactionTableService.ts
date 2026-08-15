import type { TransactionPageResponse } from "../dto/TransactionResponse";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 


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

function requireToken() {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view transactions");
  }

  return token;
}

export async function getTransactionWallets(): Promise<WalletResponse[]> {
  const token = requireToken();

  return authenticatedGet<WalletResponse[]>(
    "/api/v1/wallets",
    token,
    "Error while loading the wallets",
  );
}

export async function getTransactionsPage(walletId: number, page: number, size: number,): Promise<TransactionPageResponse> {
  const token = requireToken();
  const query = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: "date,desc",
  });

  return authenticatedGet<TransactionPageResponse>(
    `/api/v1/wallets/${walletId}/transactions?${query.toString()}`,
    token,
    "Error while loading the transactions",
  );
}
