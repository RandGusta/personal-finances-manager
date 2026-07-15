import { AutenticationLayout } from "../layouts/AutenticationLayout";
import {Box, Typography, Card, Link, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import { BaseInputField } from "../components/Input";
import { BaseButton } from "../components/Button";
import padlock from "../assets/svg/padlock.svg";
import cardImage from "../assets/images/cover-cards.png";
import { BaseForm } from "../components/Form";
import { Link as RoutesLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const emailOk = handleEmailSubmit();
    if(!emailOk){
      return;
    }
    setOpenDialog(true);
  }

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email");
      return;
    }
    setEmailError("");
    return true;
  };

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          width: "209px",
          height: "201px",
          top: { xs: "15rem", lg: "10rem", md: "24rem", sm: "20rem" },
          left: { xs: "6rem", lg: "18rem", md: "29rem" },
          borderRadius: "50%",
          bgcolor: "#1C4632",
          opacity: 0.1,
          filter: "blur(4px)",
        }}
      />
      <AutenticationLayout
        left={
          <>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  textAlign: "center",
                  color: "#1C4632",
                  position: "absolute",
                  top: { xs: "6rem", lg: "3rem", md: "24rem", sm: "20rem" },
                  left: { xs: "5rem", lg: "16rem", md: "29rem" },
                }}
              >
                Forgot password
              </Typography>
            </Box>
            <Box
              component="img"
              src={padlock}
              sx={{
                position: "absolute",
                minHeight: "7rem",
                top: { xs: "17rem", lg: "12rem", md: "24rem", sm: "20rem" },
                left: { xs: "9rem", lg: "21rem", md: "29rem" },
              }}
            />
            <Box sx={{ marginTop: "20rem" }}>
              <Typography
                variant="h3"
                sx={{ textAlign: "center", color: "#1C4632" }}
              >
                Enter your registered email to recover your password
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <BaseForm>
                  <BaseInputField label="Email" type="email" error={!!emailError} helperText={emailError}/>
                  <BaseButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    onClick={() => handleSubmit()}
                  >
                    Send
                  </BaseButton>
                </BaseForm>
                <Typography>
                  <Link component={RoutesLink} to="/login">
                    Return to Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          </>
        }
        right={
          <>
            <Box
              sx={{
                width: "100%",
                maxWidth: "35rem",
                minHeight: "19rem",
                maxHeight: "19rem",
              }}
            >
              <Card
                sx={{
                  borderRadius: "80",
                  boxShadow: "-7px 7px 5px 2px #00000038",
                  overflow: "hidden",
                }}
              >
                <Typography
                  color="primary"
                  variant="h2"
                  sx={{ padding: "40px 23px 10px 23px" }}
                >
                  Account Security
                </Typography>
                <Box sx={{ display: "flex", gap: "px" }}>
                  <Typography
                    color="primary"
                    sx={{ padding: "0 0px 0px 23px", minWidth: "20rem" }}
                  >
                    Forgot your password?
                    <br />
                    Don't worry. Account recovery is a quick and secure process
                    designed to help you regain access safely. <br />
                    Enter your registered e-mail address and follow the
                    instructions provided to create <br /> a new password and
                    continue managing your finances with confidence.
                  </Typography>
                  <Box
                    component="img"
                    src={cardImage}
                    sx={{
                      minWidth: "23rem",
                      maxHeight: "18rem",
                      transform: "translate(0px, -10px)",
                    }}
                  />
                </Box>
              </Card>
            </Box>
          </>
        }
      />
      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
>
  <DialogTitle>Email sent</DialogTitle>

  <DialogContent>
    <Typography>
      If the email exists, recovery instructions have been sent.
    </Typography>

    <Typography sx={{ mt: 2 }}>
      Please check your inbox and follow the instructions to reset your
      password.
    </Typography>
  </DialogContent>

  <DialogActions>
    <BaseButton
      variant="contained"
      onClick={() => navigate("/login")}
    >
      Back to Login
    </BaseButton>
  </DialogActions>
</Dialog>
    </>
  );
};

export default RecoverPassword;
