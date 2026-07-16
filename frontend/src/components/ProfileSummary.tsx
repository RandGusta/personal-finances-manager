import {Avatar, Box, Card, CardContent, Typography, Button} from "@mui/material";
import { BaseButton } from "./Button";
import { useNavigate } from "react-router-dom";

const ProfileSummary = () => {
    const navigate = useNavigate();
  return (
    <Card sx={{ mb: 3, height: "16rem" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            sx={{
              width: 200,
              height: 200,
              bgcolor: "#1C4632",
            }}
          >
            G
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">
              Gustavo
            </Typography>

            <Typography color="text.secondary">
              gustavo@email.com
            </Typography>

             <BaseButton
        sx={{ mt: 2 }}
        variant="contained"
        onClick={() => navigate("/redifine-password")}
    >
        Change password
    </BaseButton>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">
              Wallets
            </Typography>

            <Typography>3</Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">
              Transactions
            </Typography>

            <Typography>58</Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">
              Members
            </Typography>

            <Typography>6</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;