import type { CategoryResponse, CategoryType } from "../dto/CategoryResponse";

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
