import ProfileLayout from "../layouts/ProfileLayout";
import UserSummary from "../components/UserSummary";
import ProfileSummary from "../components/ProfileSummary";
import WalletCard from "../components/WalletCard";
import BaseNavBar from "../components/NavBar";
import { Box } from "@mui/material";
import WalletMembersModal from "../components/WalletMembersModal";
import NewWalletModal from "../components/NewWalletModal";
import { useState } from "react";

const Profile = () => {
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
      <ProfileLayout
        summary={<ProfileSummary />}
        wallets={
          <Box sx={{display:"flex", flexDirection:"column", gap:"1rem"}}>{
        wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            onOpen={() => setOpenModal(true)}
          />
        ))
        }</Box>
    }
        members={
          <WalletMembersModal
            open={openModal}
            onClose={() => setOpenModal(false)}
          />
        }
      ></ProfileLayout>
    </>
  );
};
export default Profile;
