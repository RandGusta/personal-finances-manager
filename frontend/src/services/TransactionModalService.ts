import type { TransactionRequest } from "../dto/TransactionRequest";
import type { TransactionResponse } from "../dto/TransactionResponse";

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

export async function createTransaction(
  walletId: number,
  request: TransactionRequest,
): Promise<TransactionResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to create a transaction");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallets/${walletId}/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while creating the transaction",
    );
    throw new Error(message);
  }

  return (await response.json()) as TransactionResponse;
}
