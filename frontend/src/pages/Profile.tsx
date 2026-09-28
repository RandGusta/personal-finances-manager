import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSummary from "../components/ProfileSummary";
import WalletCard from "../components/WalletCard";
import type { ProfilePageResponse } from "../dto/ProfilePageResponse";
import ProfileLayout from "../layouts/ProfileLayout";
import SidebarLayout from "../layouts/SidebarLayout";
import { getProfilePage } from "../services/ProfileService";

const Profile = () => {
  const [profilePage, setProfilePage] = useState<ProfilePageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let componentIsMounted = true;

    const loadProfilePage = async () => {
      try {
        const response = await getProfilePage();

        if (componentIsMounted) {
          setProfilePage(response);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading the profile";
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadProfilePage();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  return (
    <SidebarLayout>
      <ProfileLayout
        summary={
          <>
            {error && <Alert severity="error">{error}</Alert>}
            <ProfileSummary
              profile={profilePage?.profile ?? null}
              walletCount={profilePage?.wallets.length ?? 0}
              transactionCount={profilePage?.transactionCount ?? 0}
              memberCount={profilePage?.memberCount ?? 0}
              loading={loading}
            />
          </>
        }
        wallets={
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography variant="h5" sx={{ color: "#163832", fontSize: "1.5rem" }}>
                Wallets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profilePage?.wallets.length ?? 0} total
              </Typography>
            </Box>

            {loading && <Skeleton variant="rounded" height={140} />}

            {!loading && !error && profilePage?.wallets.length === 0 && (
              <Alert severity="info">You do not have any wallets yet.</Alert>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {!loading &&
                profilePage?.wallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    onOpen={() => navigate("/wallets")}
                  />
                ))}
            </Box>
          </Box>
        }
        members={null}
      />
    </SidebarLayout>
  );
};

export default Profile;
