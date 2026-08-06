import type { TransactionPageResponse } from "../dto/TransactionResponse";
import type { WalletMemberResponse } from "../dto/WalletMemberResponse";
import type { WalletRequest } from "../dto/WalletRequest";
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
    throw new Error("You need to sign in to view wallets");
  }

  return token;
}

export async function getWallets(): Promise<WalletResponse[]> {
  const token = requireToken();

  return authenticatedGet<WalletResponse[]>(
    "/api/v1/wallets",
    token,
    "Error while loading the wallets",
  );
}

export async function createWallet(
  request: WalletRequest,
): Promise<WalletResponse> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/wallets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while creating the wallet",
    );
    throw new Error(message);
  }

  return (await response.json()) as WalletResponse;
}

export async function getWalletMembers(
  walletId: number,
): Promise<WalletMemberResponse[]> {
  const token = requireToken();

  return authenticatedGet<WalletMemberResponse[]>(
    `/api/v1/wallets/${walletId}/members`,
    token,
    "Error while loading the wallet members",
  );
}

export async function getWalletRecentTransactions(
  walletId: number,
): Promise<TransactionPageResponse> {
  const token = requireToken();

  return authenticatedGet<TransactionPageResponse>(
    `/api/v1/wallets/${walletId}/transactions?page=0&size=5&sort=date,desc`,
    token,
    "Error while loading the wallet transactions",
  );
}
