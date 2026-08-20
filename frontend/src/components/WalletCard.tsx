import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { BaseCheckBox } from "./Checkbox";

export interface Wallet {
  id: number;
  name: string;
  description?: string | null;
  role?: string;
  memberCount?: number;
  owner?: string;
  members?: number;
}

interface WalletCardProps {
  wallet: Wallet;
  onOpen: () => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelectionChange?: () => void;
}

const WalletCard = ({
  wallet,
  onOpen,
  showCheckbox = false,
  isSelected = false,
  onSelectionChange,
}: WalletCardProps) => {
  const members = wallet.memberCount ?? wallet.members ?? 0;
  const formattedRole = wallet.role
    ? wallet.role.charAt(0) + wallet.role.slice(1).toLowerCase()
    : null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">
          {wallet.name}
        </Typography>

        {wallet.description && (
          <Typography color="text.secondary">{wallet.description}</Typography>
        )}

        <Typography>
          {formattedRole ? `Role: ${formattedRole}` : `Owner: ${wallet.owner}`}
        </Typography>

        <Typography>
          Members: {members}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onOpen}
          >
            View Wallet
          </Button>
        </Box>
        {showCheckbox && (
          <Box>
            <BaseCheckBox
              label="Select"
              checked={isSelected}
              onChange={onSelectionChange}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;
