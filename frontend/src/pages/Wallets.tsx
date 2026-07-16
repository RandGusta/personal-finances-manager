import { Box, Typography, Button } from "@mui/material";

import { useState } from "react";

import BaseNavBar from "../components/NavBar";
import WalletCard from "../components/WalletCard";
import WalletMembersModal from "../components/WalletMembersModal";
import NewWalletModal from "../components/NewWalletModal";


const Wallets = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openNewWallet, setOpenNewWallet] = useState(false);
  const wallets = [
    {
      id: 1,
      name: "Personal Wallet",
      owner: "Gustavo",
      members: 1,
    },
    {
      id: 2,
      name: "House Expenses",
      owner: "Gustavo",
      members: 3,
    },
    {
      id: 3,
      name: "Trip 2026",
      owner: "Gustavo",
      members: 2,
    },
  ];

  return (
    <>
      <BaseNavBar />

      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
          }}
        >
          <Typography variant="h4">Wallets</Typography>

          <Button variant="contained" onClick={() => setOpenNewWallet(true)}>
            New Wallet
          </Button>
        </Box>

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
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onOpen={() => setOpenModal(true)}
            />
          ))}
        </Box>

        <WalletMembersModal
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      </Box>

      <NewWalletModal
  open={openNewWallet}
  onClose={() => setOpenNewWallet(false)}
/>
    </>
  );
};

export default Wallets;
