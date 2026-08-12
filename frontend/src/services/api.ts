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