import type {
  FinancialSummaryResponse,
  UserProfileResponse,
  UserSummaryResponse,
  WalletResponse,
} from "../dto/UserSummaryResponse";
import { getErrorMessage, getStoredToken } from "./api";

const API_BASE_URL = "http://localhost:8081";

export async function getUserSummary(): Promise<UserSummaryResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view your financial summary");
  }

  const profileResponse = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!profileResponse.ok) {
    const message = await getErrorMessage(
      profileResponse,
      "Error while loading the user profile",
    );
    throw new Error(message);
  }

  const profile = (await profileResponse.json()) as UserProfileResponse;

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
  let balance = 0;
  let revenue = 0;
  let expenses = 0;

  for (const wallet of wallets) {
    const summaryResponse = await fetch(
      `${API_BASE_URL}/api/v1/wallets/${wallet.id}/summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!summaryResponse.ok) {
      const message = await getErrorMessage(
        summaryResponse,
        `Error while loading the summary for ${wallet.name}`,
      );
      throw new Error(message);
    }

    const summary = (await summaryResponse.json()) as FinancialSummaryResponse;
    balance += summary.balance;
    revenue += summary.totalIncome;
    expenses += summary.totalExpense;
  }

  return {
    userName: profile.name,
    email: profile.email,
    balance,
    revenue,
    expenses,
  };
}
