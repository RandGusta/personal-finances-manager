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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
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
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: "1px solid #8EB69B" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#163832" }}>
            Transaction history
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse transactions from the selected wallet.
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }} disabled={walletsLoading}>
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
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        {!walletsLoading && wallets.length === 0 && !error && (
          <Alert severity="info" sx={{ m: 2 }}>
            You need a wallet before adding transactions.
          </Alert>
        )}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" aria-label="Transaction history table" sx={{ minWidth: 720 }}>
            <TableHead sx={{ backgroundColor: "#DAF1DE" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#163832" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#163832" }} align="right">
                  Value
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#163832" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#163832" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#163832" }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(walletsLoading || transactionsLoading) &&
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width="75%" /></TableCell>
                    <TableCell><Skeleton width="65%" /></TableCell>
                    <TableCell><Skeleton width="65%" /></TableCell>
                    <TableCell><Skeleton width="70%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                  </TableRow>
                ))}

              {!walletsLoading && !transactionsLoading && transactionPage?.empty && !error && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 3, textAlign: "center" }}>
                    <Alert severity="info">There are no transactions in this wallet.</Alert>
                  </TableCell>
                </TableRow>
              )}

              {!transactionsLoading &&
                !error &&
                transactionPage?.content.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transaction.description ?? "No description"}
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
                    <TableCell>{transaction.categoryName ?? "Uncategorized"}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type === "INCOME" ? "Income" : "Expense"}
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
            sx={{
              px: { xs: 0, sm: 2 },
              overflowX: "auto",
              "& .MuiTablePagination-toolbar": {
                flexWrap: "wrap",
                justifyContent: "center",
                rowGap: 0.5,
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
