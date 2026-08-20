import type { CategoryRequest } from "../dto/CategoryRequest";
import type { CategoryResponse } from "../dto/CategoryResponse";
import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 

export async function createCategory(
  request: CategoryRequest,
): Promise<CategoryResponse> {
  const token = getStoredToken();

  if (!token) {
    throw new Error("You need to sign in to create a category");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while creating the category",
    );
    throw new Error(message);
  }

  return (await response.json()) as CategoryResponse;
}
