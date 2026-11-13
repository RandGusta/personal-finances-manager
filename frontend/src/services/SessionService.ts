import { API_BASE_URL } from "./api";

export async function validateSession(token: string, signal: AbortSignal): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    return false;
  }

  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Could not verify your session");
  }

  return true;
}

export function getPostLoginPath(returnTo: unknown, invitationPath: string | null): string {
  for (const path of [returnTo, invitationPath]) {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
      continue;
    }

    // Accept only destinations on the current site, including when URL syntax is ambiguous.
    try {
      const destination = new URL(path, window.location.origin);
      if (destination.origin === window.location.origin && !destination.pathname.startsWith("//")) {
        return destination.pathname + destination.search + destination.hash;
      }
    } catch {
      // Ignore malformed destinations and try the next one.
    }
  }

  return "/home";
}
