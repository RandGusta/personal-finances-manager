import type {
  ProfileFinancialSummaryResponse,
  ProfilePageResponse,
} from "../dto/ProfilePageResponse";
import type {
  UserProfileResponse,
  WalletResponse,
} from "../dto/UserSummaryResponse";

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
