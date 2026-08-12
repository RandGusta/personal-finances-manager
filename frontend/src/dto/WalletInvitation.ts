export type WalletInvitationRole = "EDITOR" | "VIEWER";

export interface WalletInvitationRequest {
  email: string;
  role: WalletInvitationRole;
}

export interface MessageResponse {
  message: string;
}
