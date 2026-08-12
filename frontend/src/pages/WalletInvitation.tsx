import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BaseButton } from "../components/Button";
import BaseNavBar from "../components/NavBar";
import { acceptWalletInvitation } from "../services/WalletPageService";
import { getStoredToken } from "../services/UserService";

const WalletInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  const isAuthenticated = !!getStoredToken();

  const saveRedirectAndNavigate = (path: string) => {
    if (token) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        `/wallet-invitations/${token}`,
      );
    }

    navigate(path);
  };

  const handleAccept = async () => {
    if (!token) {
      setError("The invitation link is invalid");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await acceptWalletInvitation(token);
      setAccepted(true);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error occurred while accepting the invitation";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isAuthenticated && <BaseNavBar />}

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F6FAFD",
          p: 2,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: "34rem" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Wallet Invitation
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {accepted ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Invitation accepted successfully. The wallet is now available
                  in your account.
                </Alert>
                <BaseButton
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/wallets")}
                >
                  View Wallets
                </BaseButton>
              </>
            ) : isAuthenticated ? (
              <>
                <Typography sx={{ mb: 3 }}>
                  Confirm that you want to join this shared wallet. The invitation
                  can only be accepted by the e-mail address that received it.
                </Typography>
                <BaseButton
                  fullWidth
                  variant="contained"
                  loading={loading}
                  disabled={!token}
                  onClick={handleAccept}
                >
                  Accept Invitation
                </BaseButton>
              </>
            ) : (
              <>
                <Typography sx={{ mb: 3 }}>
                  Sign in with the invited e-mail address before accepting. If
                  you do not have an account yet, create one first.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => saveRedirectAndNavigate("/login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => saveRedirectAndNavigate("/signup")}
                  >
                    Create Account
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default WalletInvitation;
