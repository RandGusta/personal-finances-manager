import type {
  FinancialSummaryResponse,
  CategorySummaryResponse,
  UserProfileResponse,
  UserSummaryResponse,
  WalletResponse,
} from "../dto/UserSummaryResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 

export async function getUserSummary(
  wallets: WalletResponse[],
): Promise<UserSummaryResponse> {
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

  let balance = 0;
  let revenue = 0;
  let expenses = 0;
  const categories = new Map<string, CategorySummaryResponse>();

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

    summary.byCategory.forEach((category) => {
      const categoryKey = category.categoryId?.toString() ?? "uncategorized";
      const currentCategory = categories.get(categoryKey);

      if (currentCategory) {
        currentCategory.total += category.total;
        return;
      }

      categories.set(categoryKey, { ...category });
    });
  }

  return {
    userName: profile.name,
    email: profile.email,
    balance,
    revenue,
    expenses,
    categories: Array.from(categories.values()).sort(
      (first, second) => second.total - first.total,
    ),
  };
}
