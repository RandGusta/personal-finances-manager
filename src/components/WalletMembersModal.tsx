import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
} from "@mui/material";
import { useState } from 'react';
import InviteMemberModal from "./InviteMemberModal";


interface WalletMembersModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletMembersModal = ({
  open,
  onClose,
}: WalletMembersModalProps) => {
const [openInviteMember, setOpenInviteMember] = useState(false);
  return (
  <>
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform:
            "translate(-50%, -50%)",
          bgcolor: "background.paper",
          width: {
            xs: "90%",
            md: "35rem",
          },
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 3 }}
        >
          House Expenses
        </Typography>

        <Typography variant="h6">
          Members
        </Typography>

        <List>
          <ListItem>Gustavo</ListItem>
          <ListItem>Maria</ListItem>
          <ListItem>João</ListItem>
        </List>

        <Typography
          variant="h6"
          sx={{ mt: 2 }}
        >
          Recent Transactions
        </Typography>

        <List>
          <ListItem>
            Mercado - R$ 250
          </ListItem>

          <ListItem>
            Água - R$ 80
          </ListItem>

          <ListItem>
            Internet - R$ 120
          </ListItem>
        </List>

        <Button
  variant="contained"
  onClick={() => setOpenInviteMember(true)}
>
  Invite Member
</Button>
      </Box>
    </Modal>
    <InviteMemberModal
  open={openInviteMember}
  onClose={() => setOpenInviteMember(false)}
/>
    </>
  );
};

export default WalletMembersModal;