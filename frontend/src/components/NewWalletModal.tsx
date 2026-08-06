import { Alert, Box, Button, Modal, Stack, Typography } from "@mui/material";
import { useState } from "react";
import type { WalletRequest } from "../dto/WalletRequest";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { createWallet } from "../services/WalletPageService";
import { BaseButton } from "./Button";
import { BaseInputField } from "./Input";

interface NewWalletModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (wallet: WalletResponse) => void;
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
  p: 4,
};

const NewWalletModal = ({
  open,
  onClose,
  onCreated,
}: NewWalletModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
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

    if (!normalizedName) {
      setError("Wallet name is required");
      return;
    }

    if (normalizedName.length > 100) {
      setError("Wallet name must have at most 100 characters");
      return;
    }

    if (normalizedDescription.length > 255) {
      setError("Description must have at most 255 characters");
      return;
    }

    const request: WalletRequest = {
      name: normalizedName,
      description: normalizedDescription || undefined,
    };

    try {
      setSaving(true);
      setError("");
      const createdWallet = await createWallet(request);
      resetForm();
      onClose();
      onCreated(createdWallet);
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
            Create Wallet
          </BaseButton>
        </Stack>
      </Box>
    </Modal>
  );
};

export default NewWalletModal;
