import type {
  UserProfileResponse,
  WalletResponse,
} from "./UserSummaryResponse";

export interface ProfilePageResponse {
  profile: UserProfileResponse;
  wallets: WalletResponse[];
  transactionCount: number;
  memberCount: number;
}

export interface ProfileFinancialSummaryResponse {
  transactionCount: number;
}
