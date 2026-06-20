import { Card, CardContent, Typography, Box } from "@mui/material";

interface Transactions {
  id: number;
  description: string;
  value: number;
  date: string;
  type: "INCOME" | "EXPENSE";
}

interface RecentTransactionProps {
  transactions: Transactions[];
}

const RecentTransaction = () => {
  const transactions = [
    {
      id: 1,
      description: "Mercado",
      value: 80,
      date: "15/06/2026",
      type: "EXPENSE",
    },
    {
      id: 2,
      description: "Salário",
      value: 2500,
      date: "10/06/2026",
      type: "INCOME",
    },
    {
      id: 3,
      description: "Netflix",
      value: 39.9,
      date: "08/06/2026",
      type: "EXPENSE",
    },
  ];
  return (
    <>
      <Card
        sx={{
          margin: { lg: "3rem", xs: "0rem" },
          display: { xs: "flex", lg: "block" },
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ backgroundColor: "#1C4632", padding:{xs:'1rem', lg:'0.2rem'} , textAlign: "center" }}
          >
            Recent Transactions
          </Typography>
          <Box
            sx={{
              display: {
                xs: "none",
                md: "grid",
              },
              gridTemplateColumns: {
                xs: "1fr 1fr",
                lg: "2fr 1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Description</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Value</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Date</Typography>
            </Box>
            <Box>
              <Typography variant="h6">type</Typography>
            </Box>
          </Box>
          {transactions.map((transaction) => (
            <Box
              key={transaction.id}
              sx={{
                display: {
                  xs: "block",
                  md: "grid",
                },

                gridTemplateColumns: "2fr 1fr 1fr 1fr",

                p: 2,

                borderBottom: "1px solid #ddd",
              }}
            >
              <Box>{transaction.description}</Box>
              {transaction.value}$<Box>{transaction.date}</Box>
              <Box>{transaction.type}</Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default RecentTransaction;
