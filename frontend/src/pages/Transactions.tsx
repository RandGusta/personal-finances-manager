import { Box, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState } from "react";
import { BaseButton } from "../components/Button";
import TransactionModal from "../components/TransactionModal";
import TransactionTable from "../components/TransactionTable";
import SidebarLayout from "../layouts/SidebarLayout";

const Transactions = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
