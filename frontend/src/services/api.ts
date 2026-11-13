const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:8081" : "")
).replace(/\/+$/, "");

export function getStoredToken() {
  return localStorage.getItem("token") ?? sessionStorage.getItem("token");
}

export async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  try {
    const error = await response.json() as { message?: string };
    return error.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
