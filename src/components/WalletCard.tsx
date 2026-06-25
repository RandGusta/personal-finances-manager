import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

export interface Wallet {
  id: number;
  name: string;
  owner: string;
  members: number;
}

interface WalletCardProps {
  wallet: Wallet;
  onOpen: () => void;
}

const WalletCard = ({
  wallet,
  onOpen,
}: WalletCardProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">
          {wallet.name}
        </Typography>

        <Typography>
          Owner: {wallet.owner}
        </Typography>

        <Typography>
          Members: {wallet.members}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onOpen}
          >
            View Wallet
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletCard;