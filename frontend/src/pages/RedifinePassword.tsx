import {
  Alert,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Link,
  Typography,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link as RoutesLink, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import cardImage from "../assets/images/cover-cards.png";
import { BaseButton } from "../components/Button";
import { BaseInputField } from "../components/Input";
import { AutenticationLayout } from "../layouts/AutenticationLayout";
import { changePassword } from "../services/UserService";

const RedifinePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const passwordStrength = zxcvbn(newPassword);

  const validateForm = () => {
    let formIsValid = true;

    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      formIsValid = false;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      formIsValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError("The password must have at least 8 characters");
      formIsValid = false;
    } else if (newPassword.length > 100) {
      setNewPasswordError("The password must have at most 100 characters");
      formIsValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Password confirmation is required");
      formIsValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      formIsValid = false;
    }

    return formIsValid;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setGeneralError("");

      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      setSuccessMessage(response.message);
      setOpenDialog(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error occurred while changing the password";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  const progressValue =
    newPassword.length > 0 ? (passwordStrength.score + 1) * 20 : 0;

  return (
    <>
      <AutenticationLayout
        left={
          <Box sx={{ width: "100%", maxWidth: "32rem" }}>
            <Typography variant="h2" sx={{ textAlign: "center", color: "#1C4632" }}>
              Change password
            </Typography>

            {generalError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {generalError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <BaseInputField
                label="Current password"
                type="password"
                value={currentPassword}
                error={!!currentPasswordError}
                helperText={currentPasswordError}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />

              <BaseInputField
                label="New password"
                type="password"
                value={newPassword}
                error={!!newPasswordError}
                helperText={newPasswordError}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              <BaseInputField
                label="Confirm password"
                type="password"
                value={confirmPassword}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              {newPassword.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={progressValue} />
                  <Typography sx={{ mt: 1 }}>
                    Password strength: {passwordStrength.score}/4
                  </Typography>
                </Box>
              )}

              <BaseButton fullWidth type="submit" variant="contained" loading={loading}>
                Change password
              </BaseButton>
            </Box>

            <Typography sx={{ mt: 2 }}>
              <Link component={RoutesLink} to="/profile">
                Return to profile
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
                Account security
              </Typography>
              <Box sx={{ display: "flex" }}>
                <Typography color="primary" sx={{ pl: "23px", minWidth: "20rem" }}>
                  Confirm your current password, then choose a new password with
                  at least eight characters.
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
        <DialogTitle>Password changed</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <BaseButton onClick={() => navigate("/profile")} variant="contained">
            Return to profile
          </BaseButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RedifinePassword;
