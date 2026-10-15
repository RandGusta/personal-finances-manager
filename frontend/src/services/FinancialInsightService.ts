import { API_BASE_URL, getErrorMessage, getStoredToken } from "./api";

export interface FinancialInsightResponse {
  insight: string;
  periodStart: string;
  periodEnd: string;
}

export async function getMonthlyFinancialInsight(): Promise<FinancialInsightResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to generate a financial insight");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/financial-insights/monthly`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while generating the financial insight",
    );
    throw new Error(message);
  }

  return (await response.json()) as FinancialInsightResponse;
}
