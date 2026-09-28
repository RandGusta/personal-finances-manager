import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { TransactionResponse } from "../dto/TransactionResponse";
import type { WalletResponse } from "../dto/UserSummaryResponse";
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

type RecentTransactionProps = {
  wallets: WalletResponse[] | null;
  walletsError: string;
};

const RecentTransaction = ({ wallets, walletsError }: RecentTransactionProps) => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadTransactions = async () => {
      if (wallets === null) {
        if (walletsError && componentIsMounted) {
          setError(walletsError);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getRecentTransactions(wallets);

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
  }, [wallets, walletsError]);

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: "1px solid #8EB69B" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#163832" }}>
            Recent Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your latest financial movements across all wallets.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" aria-label="Recent transactions table" sx={{ minWidth: 560 }}>
            <TableHead sx={{ backgroundColor: "#051F20" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }} align="right">
                  Value
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width="75%" /></TableCell>
                    <TableCell><Skeleton width="65%" /></TableCell>
                    <TableCell><Skeleton width="65%" /></TableCell>
                    <TableCell><Skeleton width="70%" /></TableCell>
                  </TableRow>
                ))}

              {!loading && !error && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 3, textAlign: "center" }}>
                    <Alert severity="info">There are no transactions to display.</Alert>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !error &&
                transactions.map((transaction) => (
                  <TableRow
                    key={`${transaction.walletId}-${transaction.id}`}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transaction.description ?? transaction.categoryName ?? "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: transaction.type === "INCOME" ? "success.main" : "error.main",
                        fontWeight: 700,
                      }}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {currencyFormatter.format(transaction.amount)}
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatType(transaction.type)}
                        size="small"
                        color={transaction.type === "INCOME" ? "success" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentTransaction;
