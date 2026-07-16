import {
  Modal,
  Box,
  Typography,
  Stack,
  Button,
} from "@mui/material";

import { BaseInputField } from "./Input";

interface NewWalletModalProps {
  open: boolean;
  onClose: () => void;
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
}: NewWalletModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box sx={modalStyle}>
        <Typography
          variant="h2"
          sx={{ mb: 3 }}
        >
          New Wallet
        </Typography>

        <Stack spacing={2}>
          <BaseInputField
            label="Wallet Name"
            placeholder="Family Expenses"
          />

          <BaseInputField
            label="Description"
            placeholder="Shared expenses for the house"
            multiline
            rows={3}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: "flex-end"}}
        >
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
          >
            Create Wallet
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default NewWalletModal;