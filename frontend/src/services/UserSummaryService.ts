import type {
  FinancialSummaryResponse,
  UserProfileResponse,
  UserSummaryResponse,
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

export async function getUserSummary(): Promise<UserSummaryResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view your financial summary");
  }

  const [profile, wallets] = await Promise.all([
    authenticatedGet<UserProfileResponse>(
      "/api/v1/users/me",
      token,
      "Error while loading the user profile",
    ),
    authenticatedGet<WalletResponse[]>(
      "/api/v1/wallets",
      token,
      "Error while loading the wallets",
    ),
  ]);

  const summaries = await Promise.all(
    wallets.map((wallet) =>
      authenticatedGet<FinancialSummaryResponse>(
        `/api/v1/wallets/${wallet.id}/summary`,
        token,
        `Error while loading the summary for ${wallet.name}`,
      ),
    ),
  );

  let balance = 0;
  let revenue = 0;
  let expenses = 0;

  for (const summary of summaries) {
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
