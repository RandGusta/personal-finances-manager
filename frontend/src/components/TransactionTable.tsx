import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  IconButton,
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
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useEffect, useState } from "react";
import type {
  TransactionPageResponse,
  TransactionResponse,
} from "../dto/TransactionResponse";
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
  onWalletChange: (wallet: WalletResponse | null) => void;
  showCheckboxes: boolean;
  selectedTransactionIds: number[];
  onTransactionSelectionChange: (transactionIds: number[]) => void;
  onTransactionClick?: (transaction: TransactionResponse) => void;
}

const TransactionTable = ({
  refreshKey,
  onWalletChange,
  showCheckboxes,
  selectedTransactionIds,
  onTransactionSelectionChange,
  onTransactionClick,
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
  const showEditButton = !showCheckboxes && Boolean(onTransactionClick);
  const columnCount = showCheckboxes || showEditButton ? 6 : 5;

  useEffect(() => {
    let componentIsMounted = true;

    const loadWallets = async () => {
      try {
        const response = await getTransactionWallets();

        if (componentIsMounted) {
          setWallets(response);
          const firstWallet = response[0] ?? null;
          const firstWalletId: number | "" = firstWallet?.id ?? "";
          setSelectedWalletId(firstWalletId);
          onWalletChange(firstWallet);
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
    const wallet = wallets.find((currentWallet) => currentWallet.id === walletId) ?? null;
    setSelectedWalletId(walletId);
    onWalletChange(wallet);
    onTransactionSelectionChange([]);
    setPage(0);
  };

  const toggleTransactionSelection = (transactionId: number) => {
    if (selectedTransactionIds.includes(transactionId)) {
      onTransactionSelectionChange(
        selectedTransactionIds.filter((currentId) => currentId !== transactionId),
      );
      return;
    }

    onTransactionSelectionChange([...selectedTransactionIds, transactionId]);
  };

  const visibleTransactionIds = transactionPage?.content.map((transaction) => transaction.id) ?? [];
  const allVisibleTransactionsSelected =
    visibleTransactionIds.length > 0 &&
    visibleTransactionIds.every((transactionId) => selectedTransactionIds.includes(transactionId));

  const toggleVisibleTransactionSelection = () => {
    if (allVisibleTransactionsSelected) {
      onTransactionSelectionChange(
        selectedTransactionIds.filter(
          (transactionId) => !visibleTransactionIds.includes(transactionId),
        ),
      );
      return;
    }

    const transactionIds = new Set([...selectedTransactionIds, ...visibleTransactionIds]);
    onTransactionSelectionChange(Array.from(transactionIds));
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
            <TableHead sx={{ backgroundColor: "#051F20" }}>
              <TableRow>
                {showCheckboxes && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allVisibleTransactionsSelected}
                      indeterminate={
                        !allVisibleTransactionsSelected &&
                        visibleTransactionIds.some((transactionId) =>
                          selectedTransactionIds.includes(transactionId),
                        )
                      }
                      onChange={toggleVisibleTransactionSelection}
                      slotProps={{ input: { "aria-label": "Select visible transactions" } }}
                      sx={{ color: "#DAF1DE", "&.Mui-checked": { color: "#DAF1DE" } }}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }} align="right">
                  Value
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#DAF1DE" }}>Type</TableCell>
                {showEditButton && (
                  <TableCell padding="none" aria-label="Actions" sx={{ width: 56 }} />
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {(walletsLoading || transactionsLoading) &&
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {showCheckboxes && <TableCell padding="checkbox"><Skeleton width={24} /></TableCell>}
                    <TableCell><Skeleton width="75%" /></TableCell>
                    <TableCell><Skeleton width="65%" /></TableCell>
                    <TableCell><Skeleton width="65%" /></TableCell>
                    <TableCell><Skeleton width="70%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    {showEditButton && (
                      <TableCell padding="none">
                        <Skeleton variant="circular" width={20} height={20} sx={{ mx: "auto" }} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}

              {!walletsLoading && !transactionsLoading && transactionPage?.empty && !error && (
                <TableRow>
                  <TableCell colSpan={columnCount} sx={{ py: 3, textAlign: "center" }}>
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
                    onClick={() => {
                      if (!showCheckboxes) {
                        onTransactionClick?.(transaction);
                      }
                    }}
                    sx={{
                      "&:last-child td": { borderBottom: 0 },
                      cursor: showEditButton ? "pointer" : "default",
                    }}
                  >
                    {showCheckboxes && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTransactionIds.includes(transaction.id)}
                          onChange={() => toggleTransactionSelection(transaction.id)}
                          slotProps={{ input: { "aria-label": `Select transaction ${transaction.id}` } }}
                        />
                      </TableCell>
                    )}
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
                    {showEditButton && (
                      <TableCell align="center" padding="none">
                        <IconButton
                          size="small"
                          aria-label={`Edit transaction ${transaction.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onTransactionClick?.(transaction);
                          }}
                          sx={{
                            color: "#235347",
                            "&:hover, &.Mui-focusVisible": { backgroundColor: "#DAF1DE" },
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
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
