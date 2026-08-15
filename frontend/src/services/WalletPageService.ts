import type { TransactionPageResponse } from "../dto/TransactionResponse";
import type { WalletMemberResponse } from "../dto/WalletMemberResponse";
import type { WalletRequest } from "../dto/WalletRequest";
import type {
  MessageResponse,
  WalletInvitationRequest,
} from "../dto/WalletInvitation";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 


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

export async function sendWalletInvitation(
  walletId: number,
  request: WalletInvitationRequest,
): Promise<MessageResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to invite a wallet member");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallets/${walletId}/invitations`,
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
      "Error while sending the wallet invitation",
    );
    throw new Error(message);
  }

  return (await response.json()) as MessageResponse;
}

export async function acceptWalletInvitation(
  invitationToken: string,
): Promise<WalletMemberResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to accept the wallet invitation");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/wallet-invitations/${invitationToken}/accept`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while accepting the wallet invitation",
    );
    throw new Error(message);
  }

  return (await response.json()) as WalletMemberResponse;
}
