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

export async function getTransactionsPage(
  walletId: number,
  page: number,
  size: number,
): Promise<TransactionPageResponse> {
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
