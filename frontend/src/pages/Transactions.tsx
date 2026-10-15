import { Alert, Box, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useState } from "react";
import { BaseButton } from "../components/Button";
import TransactionModal from "../components/TransactionModal";
import TransactionTable from "../components/TransactionTable";
import SidebarLayout from "../layouts/SidebarLayout";
import { downloadTransactionReport } from "../services/TransactionTableService";

const Transactions = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const handleDownloadReport = async () => {
    if (selectedWalletId === null) {
      return;
    }

    try {
      setDownloadingReport(true);
      setReportError("");
      await downloadTransactionReport(selectedWalletId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error while downloading the transaction report";
      setReportError(message);
    } finally {
      setDownloadingReport(false);
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
              disabled={selectedWalletId === null}
              loading={downloadingReport}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Report
            </BaseButton>
            <BaseButton
              variant="contained"
              color="primary"
              icon={<AddRoundedIcon />}
              onClick={() => setOpenModal(true)}
              disabled={selectedWalletId === null}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Add
            </BaseButton>
          </Box>
        </Box>

        {reportError && <Alert severity="error" sx={{ mt: 2 }}>{reportError}</Alert>}

        <TransactionTable
          refreshKey={refreshKey}
          onWalletChange={setSelectedWalletId}
        />
      </Box>

      <TransactionModal
        open={openModal}
        walletId={selectedWalletId}
        onClose={() => setOpenModal(false)}
        onCreated={() => setRefreshKey((current) => current + 1)}
      />
    </SidebarLayout>
  );
};

export default Transactions;
