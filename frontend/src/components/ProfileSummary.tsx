import { Avatar, Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { UserProfileResponse } from "../dto/UserSummaryResponse";
import { BaseButton } from "./Button";

interface ProfileSummaryProps {
  profile: UserProfileResponse | null;
  walletCount: number;
  transactionCount: number;
  memberCount: number;
  loading: boolean;
}

const ProfileSummary = ({
  profile,
  walletCount,
  transactionCount,
  memberCount,
  loading,
}: ProfileSummaryProps) => {
  const navigate = useNavigate();
  const userInitial = profile?.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Card sx={{ mb: 3, minHeight: "16rem" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            sx={{
              width: 200,
              height: 200,
              bgcolor: "#1C4632",
              fontSize: "4rem",
            }}
          >
            {loading ? <Skeleton width={60} /> : userInitial}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4">
              {loading ? <Skeleton width={180} /> : profile?.name}
            </Typography>

            <Typography color="text.secondary">
              {loading ? <Skeleton width={220} /> : profile?.email}
            </Typography>

            <BaseButton
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => navigate("/redifine-password")}
            >
              Change password
            </BaseButton>
          </Box>

          <Box sx={{ textAlign: "center", minWidth: 90 }}>
            <Typography variant="h6">Wallets</Typography>
            <Typography>{loading ? <Skeleton /> : walletCount}</Typography>
          </Box>

          <Box sx={{ textAlign: "center", minWidth: 110 }}>
            <Typography variant="h6">Transactions</Typography>
            <Typography>{loading ? <Skeleton /> : transactionCount}</Typography>
          </Box>

          <Box sx={{ textAlign: "center", minWidth: 90 }}>
            <Typography variant="h6">Members</Typography>
            <Typography>{loading ? <Skeleton /> : memberCount}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;
