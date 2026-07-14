import {Card, CardContent, Typography, Box, Chip} from "@mui/material";

export interface Transaction {
id: number;
description: string;
value: number;
date: string;
category: string;
type: "INCOME" | "EXPENSE";
}

interface TransactionTableProps {
transactions: Transaction[];
}

const TransactionTable = ({
transactions,
}: TransactionTableProps) => {
return (
<Card
sx={{
mt: 3,
}}
> <CardContent>
<Typography
variant="h5"
sx={{
bgcolor: "#1C4632",
textAlign: "center",
p: 1,
borderRadius: 1,
}}
>
Transactions </Typography>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "2fr 1fr 1fr 1fr 1fr",
        },
        gap: 2,
        mt: 3,
      }}
    >
      <Typography variant="h6">
        Description
      </Typography>

      <Typography variant="h6">
        Value
      </Typography>

      <Typography variant="h6">
        Date
      </Typography>

      <Typography variant="h6">
        Category
      </Typography>

      <Typography variant="h6">
        Type
      </Typography>
    </Box>

    {transactions.map((transaction) => (
      <Box
        key={transaction.id}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "2fr 1fr 1fr 1fr 1fr",
          },
          gap: 2,
          mt: 2,
          p: 2,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography>
          {transaction.description}
        </Typography>

        <Typography>
          R$ {transaction.value}
        </Typography>

        <Typography>
          {transaction.date}
        </Typography>

        <Typography>
          {transaction.category}
        </Typography>

        <Chip
          label={transaction.type}
          color={
            transaction.type === "INCOME"
              ? "success"
              : "error"
          }
        />
      </Box>
    ))}
  </CardContent>
</Card>


);
};

export default TransactionTable;
