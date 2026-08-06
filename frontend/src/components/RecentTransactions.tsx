import {
  Alert,
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { TransactionResponse } from "../dto/TransactionResponse";
import { getRecentTransactions } from "../services/RecentTransactionsService";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function formatType(type: TransactionResponse["type"]) {
  return type === "INCOME" ? "Income" : "Expense";
}

const RecentTransaction = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadTransactions = async () => {
      try {
        const response = await getRecentTransactions();

        if (componentIsMounted) {
          setTransactions(response);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading recent transactions";
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  return (
    <Card
      sx={{
        margin: { lg: "3rem", xs: "0rem" },
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          sx={{
            backgroundColor: "#1C4632",
            padding: { xs: "1rem", lg: "0.2rem" },
            textAlign: "center",
          }}
        >
          Recent Transactions
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box
          sx={{
            display: {
              xs: "none",
              md: "grid",
            },
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 2,
            p: 2,
          }}
        >
          <Typography variant="h6">Description</Typography>
          <Typography variant="h6">Value</Typography>
          <Typography variant="h6">Date</Typography>
          <Typography variant="h6">Type</Typography>
        </Box>

        {loading && (
          <Box sx={{ p: 2 }}>
            <Skeleton height={48} />
            <Skeleton height={48} />
            <Skeleton height={48} />
          </Box>
        )}

        {!loading && !error && transactions.length === 0 && (
          <Alert severity="info">There are no transactions to display.</Alert>
        )}

        {!loading &&
          transactions.map((transaction) => (
            <Box
              key={`${transaction.walletId}-${transaction.id}`}
              sx={{
                display: {
                  xs: "block",
                  md: "grid",
                },
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: 2,
                p: 2,
                borderBottom: "1px solid #ddd",
              }}
            >
              <Typography>
                {transaction.description ?? transaction.categoryName ?? "No description"}
              </Typography>
              <Typography
                color={transaction.type === "INCOME" ? "success.main" : "error.main"}
              >
                {currencyFormatter.format(transaction.amount)}
              </Typography>
              <Typography>{formatDate(transaction.date)}</Typography>
              <Typography>{formatType(transaction.type)}</Typography>
            </Box>
          ))}
      </CardContent>
    </Card>
  );
};

export default RecentTransaction;
