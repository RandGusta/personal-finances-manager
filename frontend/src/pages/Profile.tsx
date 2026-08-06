import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseNavBar from "../components/NavBar";
import ProfileSummary from "../components/ProfileSummary";
import WalletCard from "../components/WalletCard";
import type { ProfilePageResponse } from "../dto/ProfilePageResponse";
import ProfileLayout from "../layouts/ProfileLayout";
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
    <>
      <BaseNavBar />
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Typography variant="h4">Wallets</Typography>

            {loading && <Skeleton variant="rounded" height={140} />}

            {!loading && !error && profilePage?.wallets.length === 0 && (
              <Alert severity="info">You do not have any wallets yet.</Alert>
            )}

            {!loading &&
              profilePage?.wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onOpen={() => navigate("/wallets")}
                />
              ))}
          </Box>
        }
        members={null}
      />
    </>
  );
};

export default Profile;
