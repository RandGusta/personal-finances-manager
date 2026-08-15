import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  MessageResponse,
  ResetPasswordRequest,
} from "../dto/PasswordRecovery";

import { getErrorMessage, getStoredToken, API_BASE_URL } from "./api"; 



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
