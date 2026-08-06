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

export async function getWallets(): Promise<WalletResponse[]> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view wallets");
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

export async function createWallet(
  request: WalletRequest,
): Promise<WalletResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to create a wallet");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/wallets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Error while creating the wallet");
    throw new Error(message);
  }

  const createdWallet = (await response.json()) as WalletResponse;
  return createdWallet;
}

export async function getWalletMembers(
  walletId: number,
): Promise<WalletMemberResponse[]> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view wallet members");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallets/${walletId}/members`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while loading the wallet members",
    );
    throw new Error(message);
  }

  const members = (await response.json()) as WalletMemberResponse[];
  return members;
}

export async function getWalletRecentTransactions(
  walletId: number,
): Promise<TransactionPageResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view wallet transactions");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallets/${walletId}/transactions?page=0&size=5&sort=date,desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while loading the wallet transactions",
    );
    throw new Error(message);
  }

  const transactions = (await response.json()) as TransactionPageResponse;
  return transactions;
}
