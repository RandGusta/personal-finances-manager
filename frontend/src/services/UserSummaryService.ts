import type { UserSummaryResponse } from "../dto/UserSummaryResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api";

export async function getUserSummary(): Promise<UserSummaryResponse> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("You need to sign in to view your financial summary");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Error while loading your financial summary"));
  }
  return (await response.json()) as UserSummaryResponse;
}
