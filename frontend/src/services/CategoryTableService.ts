import type { CategoryResponse, CategoryType } from "../dto/CategoryResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 



export async function getCategories(
  type?: CategoryType,
): Promise<CategoryResponse[]> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to view categories");
  }

  const query = type ? `?type=${type}` : "";
  const response = await fetch(`${API_BASE_URL}/api/v1/categories${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while loading the categories",
    );
    throw new Error(message);
  }

  return (await response.json()) as CategoryResponse[];
}
