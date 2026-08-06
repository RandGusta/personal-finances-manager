import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  MessageResponse,
  ResetPasswordRequest,
} from "../dto/PasswordRecovery";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

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

export async function requestPasswordRecovery(
  email: string,
): Promise<ForgotPasswordResponse> {
  const request: ForgotPasswordRequest = {
    email,
  };

  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Error while requesting password recovery",
    );
    throw new Error(message);
  }

  const data = (await response.json()) as ForgotPasswordResponse;
  return data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<MessageResponse> {
  const request: ResetPasswordRequest = {
    token,
    newPassword,
  };

  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "The recovery link is invalid or has expired",
    );
    throw new Error(message);
  }

  const data = (await response.json()) as MessageResponse;
  return data;
}
