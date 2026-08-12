import { Alert, Box, Button, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import BaseNavBar from "../components/NavBar";
import NewWalletModal from "../components/NewWalletModal";
import WalletCard from "../components/WalletCard";
import WalletMembersModal from "../components/WalletMembersModal";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { getWallets } from "../services/WalletPageService";

const Wallets = () => {
  const [wallets, setWallets] = useState<WalletResponse[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletResponse | null>(null);
  const [openNewWallet, setOpenNewWallet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadWallets = async () => {
      try {
        const response = await getWallets();

        if (componentIsMounted) {
          setWallets(response);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading wallets";
          setWallets([]);
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadWallets();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  return (
    <>
      <BaseNavBar />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography variant="h4">Wallets</Typography>

          <Button variant="contained" onClick={() => setOpenNewWallet(true)}>
            New Wallet
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && <Skeleton variant="rounded" height={180} />}

        {!loading && !error && wallets.length === 0 && (
          <Alert severity="info">You do not have any wallets yet.</Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {!loading &&
            wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onOpen={() => setSelectedWallet(wallet)}
              />
            ))}
        </Box>

        <WalletMembersModal
          open={selectedWallet !== null}
          wallet={selectedWallet}
          onClose={() => setSelectedWallet(null)}
        />
      </Box>

      <NewWalletModal
        open={openNewWallet}
        onClose={() => setOpenNewWallet(false)}
        onCreated={(wallet, invitationWarning) => {
          setWallets((currentWallets) => [...currentWallets, wallet]);
          setError(invitationWarning ?? "");
        }}
      />
    </>
  );
};

export default Wallets;
