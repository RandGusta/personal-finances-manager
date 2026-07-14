import {Typography, Box, Button } from "@mui/material";
import { useState } from "react";

import BaseNavBar from "../components/NavBar";
import TransactionTable from "../components/TransactionTable";
import TransactionModal from "../components/TransactionModal"

const Transactions = () => {
const [openModal, setOpenModal] = useState(false);
const transactions = [
{
id: 1,
description: "Salary",
value: 2500,
date: "10/06/2026",
category: "Work",
type: "INCOME" as const,
},
{
id: 2,
description: "Market",
value: 180,
date: "15/06/2026",
category: "Food",
type: "EXPENSE" as const,
},
{
id: 3,
description: "Netflix",
value: 39.90,
date: "20/06/2026",
category: "Entertainment",
type: "EXPENSE" as const,
},
];

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

    <TransactionTable
      transactions={transactions}
    />
  </Box>
  <TransactionModal
  open={openModal}
  onClose={() => setOpenModal(false)}
/>
</>


);
};

export default Transactions;
