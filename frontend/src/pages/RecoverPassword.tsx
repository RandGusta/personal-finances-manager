import {
  Alert,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link as RoutesLink, useNavigate } from "react-router-dom";
import cardImage from "../assets/images/cover-cards.png";
import padlock from "../assets/svg/padlock.svg";
import { BaseButton } from "../components/Button";
import { BaseInputField } from "../components/Input";
import { AutenticationLayout } from "../layouts/AutenticationLayout";
import { requestPasswordRecovery } from "../services/PasswordRecoveryService";

const RecoverPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [debugToken, setDebugToken] = useState("");

  const validateEmail = () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setEmailError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError("Invalid email");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail()) {
      return;
    }

    try {
      setLoading(true);
      setGeneralError("");

      const response = await requestPasswordRecovery(email.trim());
      setResponseMessage(response.message);
      setDebugToken(response.debugToken ?? "");
      setOpenDialog(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error occurred while requesting password recovery";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AutenticationLayout
        left={
          <Box sx={{ width: "100%", maxWidth: "32rem" }}>
            <Typography variant="h2" sx={{ textAlign: "center", color: "#1C4632" }}>
              Forgot password
            </Typography>

            <Box
              component="img"
              src={padlock}
              alt="Padlock"
              sx={{ display: "block", height: "7rem", margin: "2rem auto" }}
            />

            <Typography variant="h3" sx={{ textAlign: "center", color: "#1C4632" }}>
              Enter your registered email to recover your password
            </Typography>

            {generalError && <Alert severity="error" sx={{ mt: 2 }}>{generalError}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <BaseInputField
                label="Email"
                type="email"
                value={email}
                error={!!emailError}
                helperText={emailError}
                onChange={(event) => setEmail(event.target.value)}
              />

              <BaseButton fullWidth type="submit" variant="contained" loading={loading}>
                Send
              </BaseButton>
            </Box>

            <Typography sx={{ mt: 2 }}>
              <Link component={RoutesLink} to="/login">
                Return to Login
              </Link>
            </Typography>
          </Box>
        }
        right={
          <Box sx={{ width: "100%", maxWidth: "35rem" }}>
            <Card
              sx={{
                borderRadius: "80px",
                boxShadow: "-7px 7px 5px 2px #00000038",
                overflow: "hidden",
              }}
            >
              <Typography color="primary" variant="h2" sx={{ p: "40px 23px 10px" }}>
                Account Security
              </Typography>
              <Box sx={{ display: "flex" }}>
                <Typography color="primary" sx={{ pl: "23px", minWidth: "20rem" }}>
                  Enter your registered e-mail address and use the recovery link
                  to create a new password securely.
                </Typography>
                <Box
                  component="img"
                  src={cardImage}
                  alt="Finance cards"
                  sx={{ minWidth: "23rem", maxHeight: "18rem", transform: "translateY(-10px)" }}
                />
              </Box>
            </Card>
          </Box>
        }
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Recovery requested</DialogTitle>
        <DialogContent>
          <Typography>{responseMessage}</Typography>

          {debugToken && (
            <Alert severity="info" sx={{ mt: 2 }}>
              E-mail delivery is not configured yet. Use the development link below:
              {" "}
              <Link component={RoutesLink} to={`/reset-password/${debugToken}`}>
                Reset password
              </Link>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <BaseButton onClick={() => navigate("/login")} variant="outlined">
            Back to Login
          </BaseButton>
          {debugToken && (
            <BaseButton
              onClick={() => navigate(`/reset-password/${debugToken}`)}
              variant="contained"
            >
              Continue
            </BaseButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecoverPassword;
