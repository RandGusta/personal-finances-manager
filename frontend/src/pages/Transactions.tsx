import {Typography, Box, Button } from "@mui/material";
import { useState } from "react";

import BaseNavBar from "../components/NavBar";
import TransactionTable from "../components/TransactionTable";
import TransactionModal from "../components/TransactionModal"

const Transactions = () => {
const [openModal, setOpenModal] = useState(false);

return (
<> <BaseNavBar />

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
        flexDirection: {
          xs: "column",
          md: "row",
        },
        gap: 2,
      }}
    >
      <Typography variant="h4">
        Transactions
      </Typography>

      <Button
  variant="contained"
  color="primary"
  onClick={() => setOpenModal(true)}
>
  New Transaction
</Button>
    </Box>

    <TransactionTable />
  </Box>
  <TransactionModal
  open={openModal}
  onClose={() => setOpenModal(false)}
/>
</>


);
};

export default Transactions;
