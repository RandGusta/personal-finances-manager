import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TablePagination,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { TransactionPageResponse } from "../dto/TransactionResponse";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import {
  getTransactionsPage,
  getTransactionWallets,
} from "../services/TransactionTableService";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

interface TransactionTableProps {
  refreshKey: number;
  onWalletChange: (walletId: number | null) => void;
}

const TransactionTable = ({
  refreshKey,
  onWalletChange,
}: TransactionTableProps) => {
  const [wallets, setWallets] = useState<WalletResponse[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | "">("");
  const [transactionPage, setTransactionPage] =
    useState<TransactionPageResponse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadWallets = async () => {
      try {
        const response = await getTransactionWallets();

        if (componentIsMounted) {
          setWallets(response);
          const firstWalletId: number | "" =
            response.length > 0 ? response[0].id : "";
          setSelectedWalletId(firstWalletId);
          onWalletChange(firstWalletId === "" ? null : firstWalletId);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading the wallets";
          onWalletChange(null);
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setWalletsLoading(false);
        }
      }
    };

    loadWallets();

    return () => {
      componentIsMounted = false;
    };
  }, [onWalletChange]);

  useEffect(() => {
    if (selectedWalletId === "") {
      return;
    }

    let componentIsMounted = true;

    const loadTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const response = await getTransactionsPage(
          selectedWalletId,
          page,
          rowsPerPage,
        );

        if (componentIsMounted) {
          setTransactionPage(response);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading transactions";
          setTransactionPage(null);
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setTransactionsLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      componentIsMounted = false;
    };
  }, [page, refreshKey, rowsPerPage, selectedWalletId]);

  const handleWalletChange = (walletId: number) => {
    setSelectedWalletId(walletId);
    onWalletChange(walletId);
    setPage(0);
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography
          variant="h5"
          sx={{
            bgcolor: "#1C4632",
            textAlign: "center",
            p: 1,
            borderRadius: 1,
          }}
        >
          Transactions
        </Typography>

        <FormControl fullWidth sx={{ mt: 3 }} disabled={walletsLoading}>
          <InputLabel id="transaction-wallet-label">Wallet</InputLabel>
          <Select
            labelId="transaction-wallet-label"
            value={selectedWalletId}
            label="Wallet"
            onChange={(event) => handleWalletChange(Number(event.target.value))}
          >
            {wallets.map((wallet) => (
              <MenuItem key={wallet.id} value={wallet.id}>
                {wallet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {!walletsLoading && wallets.length === 0 && !error && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You need a wallet before adding transactions.
          </Alert>
        )}

        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 2,
            mt: 3,
          }}
        >
          <Typography variant="h6">Description</Typography>
          <Typography variant="h6">Value</Typography>
          <Typography variant="h6">Date</Typography>
          <Typography variant="h6">Category</Typography>
          <Typography variant="h6">Type</Typography>
        </Box>

        {(walletsLoading || transactionsLoading) && (
          <Box sx={{ mt: 2 }}>
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </Box>
        )}

        {!transactionsLoading &&
          transactionPage?.content.map((transaction) => (
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
                {transaction.description ?? "No description"}
              </Typography>
              <Typography>{currencyFormatter.format(transaction.amount)}</Typography>
              <Typography>{formatDate(transaction.date)}</Typography>
              <Typography>{transaction.categoryName ?? "Uncategorized"}</Typography>
              <Chip
                label={transaction.type === "INCOME" ? "Income" : "Expense"}
                color={transaction.type === "INCOME" ? "success" : "error"}
              />
            </Box>
          ))}

        {!transactionsLoading && transactionPage?.empty && !error && (
          <Alert severity="info" sx={{ mt: 2 }}>
            There are no transactions in this wallet.
          </Alert>
        )}

        {transactionPage && (
          <TablePagination
            component="div"
            count={transactionPage.totalElements}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
