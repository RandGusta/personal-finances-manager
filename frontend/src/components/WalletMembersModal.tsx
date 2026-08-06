import {
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Modal,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { TransactionResponse } from "../dto/TransactionResponse";
import type { WalletMemberResponse } from "../dto/WalletMemberResponse";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import {
  getWalletMembers,
  getWalletRecentTransactions,
} from "../services/WalletPageService";

interface WalletMembersModalProps {
  open: boolean;
  wallet: WalletResponse | null;
  onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const WalletMembersModal = ({
  open,
  wallet,
  onClose,
}: WalletMembersModalProps) => {
  const [members, setMembers] = useState<WalletMemberResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !wallet) {
      return;
    }

    let componentIsMounted = true;

    const loadWalletDetails = async () => {
      try {
        setLoading(true);
        const [memberResponse, transactionResponse] = await Promise.all([
          getWalletMembers(wallet.id),
          getWalletRecentTransactions(wallet.id),
        ]);

        if (componentIsMounted) {
          setMembers(memberResponse);
          setTransactions(transactionResponse.content);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading the wallet";
          setMembers([]);
          setTransactions([]);
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadWalletDetails();

    return () => {
      componentIsMounted = false;
    };
  }, [open, wallet]);

  return (
      <Modal open={open && wallet !== null} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            width: { xs: "90%", md: "35rem" },
            maxHeight: "85vh",
            overflowY: "auto",
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" sx={{ mb: 1 }}>
            {wallet?.name}
          </Typography>

          {wallet?.description && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {wallet.description}
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Typography variant="h6">Members</Typography>

          {loading ? (
            <Skeleton height={100} />
          ) : members.length === 0 && !error ? (
            <Alert severity="info">This wallet does not have members.</Alert>
          ) : (
            <List>
              {members.map((member) => (
                <ListItem key={member.userId} disableGutters>
                  <ListItemText
                    primary={member.name}
                    secondary={`${member.email} · ${member.role}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Typography variant="h6" sx={{ mt: 2 }}>
            Recent Transactions
          </Typography>

          {loading ? (
            <Skeleton height={120} />
          ) : transactions.length === 0 && !error ? (
            <Alert severity="info">This wallet does not have transactions.</Alert>
          ) : (
            <List>
              {transactions.map((transaction) => (
                <ListItem key={transaction.id} disableGutters>
                  <ListItemText
                    primary={
                      transaction.description ??
                      transaction.categoryName ??
                      "No description"
                    }
                    secondary={`${currencyFormatter.format(transaction.amount)} · ${transaction.date}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

        </Box>
      </Modal>
  );
};

export default WalletMembersModal;
