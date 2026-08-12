import type {
  ProfileFinancialSummaryResponse,
  ProfilePageResponse,
} from "../dto/ProfilePageResponse";
import type {
  UserProfileResponse,
  WalletResponse,
} from "../dto/UserSummaryResponse";

import { getErrorMessage, getStoredToken } from "./api";

const API_BASE_URL = "http://localhost:8081";


export async function getProfilePage(): Promise<ProfilePageResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view your profile");
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
  let transactionCount = 0;
  let memberCount = 0;

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

    const summary =
      (await summaryResponse.json()) as ProfileFinancialSummaryResponse;
    transactionCount += summary.transactionCount;
    memberCount += wallet.memberCount;
  }

  return {
    profile,
    wallets,
    transactionCount,
    memberCount,
  };
}
