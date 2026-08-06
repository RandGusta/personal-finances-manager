import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import BaseNavBar from "../components/NavBar";
import TransactionModal from "../components/TransactionModal";
import TransactionTable from "../components/TransactionTable";

const Transactions = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <BaseNavBar />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography variant="h4">Transactions</Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenModal(true)}
            disabled={selectedWalletId === null}
          >
            New Transaction
          </Button>
        </Box>

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
    </>
  );
};

export default Transactions;
