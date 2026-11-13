import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import { Avatar, Box, Card, CardContent, Divider, Skeleton, Stack, Typography } from "@mui/material";
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

const ProfileSummary = ({profile, walletCount, transactionCount, memberCount, loading }: ProfileSummaryProps) => {
  const navigate = useNavigate();
  const userInitial = profile?.name.trim().charAt(0).toUpperCase() || "?";
  const avatarUrl = profile
    ? `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(profile.id.toString())}&backgroundColor=e8f5e9`
    : undefined;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 2, md: 3 },
            flexWrap: "wrap",
          }}
        >
          <Avatar
            src={avatarUrl}
            alt={profile?.name}
            sx={{
              width: { xs: 80, md: 96 },
              height: { xs: 80, md: 96 },
              bgcolor: "#163832",
              fontSize: "2.25rem",
              border: "3px solid #DAF1DE",
            }}
          >
            {loading ? <Skeleton variant="circular" width={72} height={72} /> : userInitial}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
            <Typography variant="overline" color="text.secondary">
              Account
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: "1.7rem", md: "2rem" }, fontWeight: 700, lineHeight: 1.2 }}
            >
              {loading ? <Skeleton width={180} /> : profile?.name}
            </Typography>

            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, alignItems: "flex-start" }}>
              <EmailOutlinedIcon fontSize="small" color="action" />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: "anywhere" }}
              >
                {loading ? <Skeleton width={220} /> : profile?.email}
              </Typography>
            </Stack>

            <BaseButton
              sx={{ mt: 2.5 }}
              variant="outlined"
              icon={<KeyRoundedIcon />}
              onClick={() => navigate("/redifine-password")}
            >
              Password
            </BaseButton>
          </Box>

          <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(72px, 1fr))",
              gap: { xs: 1.5, md: 3 },
              width: { xs: "100%", md: "auto" },
              textAlign: "center",
            }}
          >
            {[
              { label: "Wallets", value: walletCount },
              { label: "Transactions", value: transactionCount },
              { label: "Members", value: memberCount },
            ].map((item) => (
              <Box key={item.label}>
                <Typography variant="h6" sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
                  {loading ? <Skeleton width={28} /> : item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;
