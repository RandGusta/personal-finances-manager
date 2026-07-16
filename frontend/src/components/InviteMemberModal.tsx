import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";

import { useState } from "react";

import { BaseInputField } from "./Input";

interface InviteMemberModalProps {
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
    sm: 450,
  },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

const InviteMemberModal = ({
  open,
  onClose,
}: InviteMemberModalProps) => {
const [openInviteMember, setOpenInviteMember] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box sx={modalStyle}>
        <Typography
          variant="h2"
          sx={{ mb: 3}}
        >
          Invite Member
        </Typography>

        <BaseInputField
          label="Email"
          type="email"
          placeholder="friend@email.com"
        />

        <Stack
          direction="row"
          spacing={2}
        //   justifyContent="flex-end"
          sx={{ mt: 4 }}
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
            Send Invite
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default InviteMemberModal;