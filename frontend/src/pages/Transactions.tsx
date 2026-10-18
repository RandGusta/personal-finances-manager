import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useCallback, useEffect, useState } from "react";
import { BaseButton } from "../components/Button";
import TransactionModal from "../components/TransactionModal";
import TransactionTable from "../components/TransactionTable";
import SidebarLayout from "../layouts/SidebarLayout";
import { downloadTransactionReport } from "../services/TransactionTableService";
import { subscribeToWalletUpdates } from "../services/WalletRealtimeService";
import { deleteTransaction } from "../services/TransactionModalService";
import type { WalletResponse } from "../dto/UserSummaryResponse";

const Transactions = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<number[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canModifyTransactions =
    selectedWallet !== null && selectedWallet.role !== "VIEWER";

  useEffect(() => {
    return subscribeToWalletUpdates(() => {
      setRefreshKey((current) => current + 1);
    });
  }, []);

  const handleDownloadReport = async () => {
    if (selectedWallet === null) {
      return;
    }

    try {
      setDownloadingReport(true);
      setActionError("");
      await downloadTransactionReport(selectedWallet.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error while downloading the transaction report";
      setActionError(message);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleWalletChange = useCallback((wallet: WalletResponse | null) => {
    setSelectedWallet(wallet);
    setShowCheckboxes(false);
    setSelectedTransactionIds([]);
  }, []);

  const startTransactionSelection = () => {
    setShowCheckboxes(true);
    setSelectedTransactionIds([]);
  };

  const cancelTransactionSelection = () => {
    setShowCheckboxes(false);
    setSelectedTransactionIds([]);
  };

  const confirmDeleteTransactions = async () => {
    if (selectedWallet === null) {
      return;
    }

    const deletedTransactionIds: number[] = [];

    try {
      setDeleting(true);
      setActionError("");

      for (const transactionId of selectedTransactionIds) {
        await deleteTransaction(selectedWallet.id, transactionId);
        deletedTransactionIds.push(transactionId);
      }

      setSelectedTransactionIds([]);
      setShowCheckboxes(false);
      setOpenDeleteDialog(false);
      setRefreshKey((current) => current + 1);
    } catch (deleteError) {
      setSelectedTransactionIds((currentIds) =>
        currentIds.filter((id) => !deletedTransactionIds.includes(id)),
      );
      setRefreshKey((current) => current + 1);
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Error occurred while deleting transactions";
      setActionError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SidebarLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "2rem", md: "2.35rem" },
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage the financial movements in your wallets.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <BaseButton
              variant="outlined"
              icon={<FileDownloadOutlinedIcon />}
              onClick={handleDownloadReport}
              disabled={selectedWallet === null}
              loading={downloadingReport}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Report
            </BaseButton>
            {canModifyTransactions && (
              <>
                <BaseButton
                  variant="contained"
                  color="primary"
                  icon={<AddRoundedIcon />}
                  onClick={() => setOpenModal(true)}
                  disabled={selectedWallet === null}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  Add
                </BaseButton>
                {!showCheckboxes ? (
                  <BaseButton
                    variant="outlined"
                    color="error"
                    icon={<DeleteOutlineRoundedIcon />}
                    onClick={startTransactionSelection}
                    disabled={selectedWallet === null}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    Delete
                  </BaseButton>
                ) : (
                  <>
                    <BaseButton
                      variant="outlined"
                      icon={<CloseRoundedIcon />}
                      onClick={cancelTransactionSelection}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Cancel
                    </BaseButton>
                    <BaseButton
                      variant="contained"
                      color="error"
                      icon={<DeleteOutlineRoundedIcon />}
                      disabled={selectedTransactionIds.length === 0}
                      onClick={() => setOpenDeleteDialog(true)}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Delete ({selectedTransactionIds.length})
                    </BaseButton>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>

        {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}

        <TransactionTable
          refreshKey={refreshKey}
          onWalletChange={handleWalletChange}
          showCheckboxes={showCheckboxes}
          selectedTransactionIds={selectedTransactionIds}
          onTransactionSelectionChange={setSelectedTransactionIds}
        />
      </Box>

      <TransactionModal
        open={openModal}
        walletId={selectedWallet?.id ?? null}
        onClose={() => setOpenModal(false)}
        onSaved={() => setRefreshKey((current) => current + 1)}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          if (!deleting) {
            setOpenDeleteDialog(false);
          }
        }}
      >
        <DialogTitle>Delete selected transactions?</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedTransactionIds.length === 1
              ? "This transaction will be permanently deleted."
              : `${selectedTransactionIds.length} transactions will be permanently deleted.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <BaseButton
            variant="outlined"
            icon={<CloseRoundedIcon />}
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleting}
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="contained"
            color="error"
            icon={<DeleteOutlineRoundedIcon />}
            onClick={confirmDeleteTransactions}
            loading={deleting}
          >
            Delete
          </BaseButton>
        </DialogActions>
      </Dialog>
    </SidebarLayout>
  );
};

export default Transactions;
