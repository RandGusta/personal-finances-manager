import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { BaseCheckBox } from "./Checkbox";
import { BaseButton } from "./Button";

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
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1.15rem", fontWeight: 700 }}>
            {wallet.name}
          </Typography>
          {formattedRole && <Chip label={formattedRole} size="small" variant="outlined" />}
        </Box>

        {wallet.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {wallet.description}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mt: 2, alignItems: "center", color: "text.secondary" }}
        >
          <GroupOutlinedIcon fontSize="small" />
          <Typography variant="body2">
            {members} {members === 1 ? "member" : "members"}
          </Typography>
        </Stack>

        <Box sx={{ mt: "auto", pt: 2 }}>
          <BaseButton
            variant="outlined"
            icon={<VisibilityOutlinedIcon />}
            onClick={onOpen}
          >
            View
          </BaseButton>
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
