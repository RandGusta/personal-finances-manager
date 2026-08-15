import type { TransactionRequest } from "../dto/TransactionRequest";
import type { TransactionResponse } from "../dto/TransactionResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 



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
