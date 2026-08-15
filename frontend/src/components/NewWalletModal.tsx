import {
  Alert,
  Box,
  Button,
  MenuItem,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { WalletRequest } from "../dto/WalletRequest";
import type { WalletInvitationRole } from "../dto/WalletInvitation";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import {
  createWallet,
  sendWalletInvitation,
} from "../services/WalletPageService";
import { BaseButton } from "./Button";
import { BaseInputField } from "./Input";

interface NewWalletModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (wallet: WalletResponse, invitationWarning?: string) => void;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90%",
    sm: 500,
  },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  maxHeight: "90vh",
  overflowY: "auto",
  p: 4,
};

const NewWalletModal = ({
  open,
  onClose,
  onCreated,
}: NewWalletModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WalletInvitationRole>("VIEWER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setInviteEmail("");
    setInviteRole("VIEWER");
    setError("");
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const normalizedInviteEmail = inviteEmail.trim();

    if (!normalizedName) {
      setError("Wallet name is required");
      return;
    }

    if (normalizedName.length > 50) {
      setError("Wallet name must have at most 50 characters");
      return;
    }

    if (normalizedDescription.length > 40) {
      setError("Description must have at most 40 characters");
      return;
    }

    if (normalizedInviteEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedInviteEmail)) {
        setError("Invalid invitation e-mail");
        return;
      }
    }

    const request: WalletRequest = {
      name: normalizedName,
      description: normalizedDescription || undefined,
    };

    try {
      setSaving(true);
      setError("");
      const createdWallet = await createWallet(request);

      let invitationWarning: string | undefined;

      if (normalizedInviteEmail) {
        try {
          await sendWalletInvitation(createdWallet.id, {
            email: normalizedInviteEmail,
            role: inviteRole,
          });
        } catch (invitationError) {
          const invitationMessage =
            invitationError instanceof Error
              ? invitationError.message
              : "The invitation could not be sent";
          invitationWarning = `Wallet created, but invitation failed: ${invitationMessage}`;
        }
      }

      resetForm();
      onClose();
      onCreated(createdWallet, invitationWarning);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error occurred while creating the wallet";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          New Wallet
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack spacing={2}>
          <BaseInputField
            label="Wallet Name"
            placeholder="Family Expenses"
            value={name}
            onChange={(event) => setName(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            required
          />

          <BaseInputField
            label="Description"
            placeholder="Shared expenses for the house"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            multiline
            rows={3}
          />

          <Typography variant="h6" sx={{ pt: 1 }}>
            Invite a member (optional)
          </Typography>

          <Typography color="text.secondary">
            The member will receive a link and will join the wallet only after
            signing in and accepting the invitation.
          </Typography>

          <BaseInputField
            label="Member E-mail"
            type="email"
            placeholder="friend@email.com"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />

          <BaseInputField
            select
            label="Member Role"
            value={inviteRole}
            onChange={(event) =>
              setInviteRole(event.target.value as WalletInvitationRole)
            }
            disabled={!inviteEmail.trim()}
          >
            <MenuItem value="VIEWER">Viewer</MenuItem>
            <MenuItem value="EDITOR">Editor</MenuItem>
          </BaseInputField>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>

          <BaseButton variant="contained" onClick={handleCreate} loading={saving}>
            {inviteEmail.trim() ? "Create and Send Invite" : "Create Wallet"}
          </BaseButton>
        </Stack>
      </Box>
    </Modal>
  );
};

export default NewWalletModal;
