import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import BaseNavBar from "../components/NavBar";
import NewWalletModal from "../components/NewWalletModal";
import WalletCard from "../components/WalletCard";
import WalletMembersModal from "../components/WalletMembersModal";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { deleteWallet, getWallets } from "../services/WalletPageService";

const Wallets = () => {
  const [wallets, setWallets] = useState<WalletResponse[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletResponse | null>(null);
  const [openNewWallet, setOpenNewWallet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedWalletIds, setSelectedWalletIds] = useState<number[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startWalletSelection = () => {
    setShowCheckboxes(true);
    setSelectedWalletIds([]);
  };

  const cancelWalletSelection = () => {
    setShowCheckboxes(false);
    setSelectedWalletIds([]);
  };

  const toggleWalletSelection = (walletId: number) => {
    setSelectedWalletIds((currentIds) => {
      const walletIsSelected = currentIds.includes(walletId);

      if (walletIsSelected) {
        return currentIds.filter((id) => id !== walletId);
      }

      return [...currentIds, walletId];
    });
  };

  const confirmDeleteWallets = async () => {
    const deletedWalletIds: number[] = [];

    try {
      setDeleting(true);
      setError("");

      for (const walletId of selectedWalletIds) {
        await deleteWallet(walletId);
        deletedWalletIds.push(walletId);
      }

      setWallets((currentWallets) =>
        currentWallets.filter((wallet) => !deletedWalletIds.includes(wallet.id)),
      );
      setSelectedWalletIds([]);
      setShowCheckboxes(false);
      setOpenDeleteDialog(false);

      if (selectedWallet && deletedWalletIds.includes(selectedWallet.id)) {
        setSelectedWallet(null);
      }
    } catch (deleteError) {
      setWallets((currentWallets) =>
        currentWallets.filter((wallet) => !deletedWalletIds.includes(wallet.id)),
      );
      setSelectedWalletIds((currentIds) =>
        currentIds.filter((id) => !deletedWalletIds.includes(id)),
      );

      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Error occurred while deleting wallets";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

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

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => setOpenNewWallet(true)}>
              New Wallet
            </Button>

            {!showCheckboxes ? (
              <Button variant="outlined" color="error" onClick={startWalletSelection}>
                Delete Wallets
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={cancelWalletSelection}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  disabled={selectedWalletIds.length === 0}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  Delete selected ({selectedWalletIds.length})
                </Button>
              </>
            )}
          </Box>
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
                showCheckbox={showCheckboxes}
                isSelected={selectedWalletIds.includes(wallet.id)}
                onSelectionChange={() => toggleWalletSelection(wallet.id)}
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

      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          if (!deleting) {
            setOpenDeleteDialog(false);
          }
        }}
      >
        <DialogTitle>Delete selected wallets?</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedWalletIds.length === 1
              ? "This wallet and its transactions will be permanently deleted."
              : `${selectedWalletIds.length} wallets and their transactions will be permanently deleted.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteWallets}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Wallets;
