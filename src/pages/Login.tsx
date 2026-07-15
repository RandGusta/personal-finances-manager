import { BaseButton } from "../components/Button";
import { BaseInputField } from "../components/Input";
import { BaseCheckBox } from "../components/Checkbox";
import { Typography, Link, LinearProgress, Box, Card } from "@mui/material";
import { AutenticationLayout } from "../layouts/AutenticationLayout";
import cardImage from "../assets/images/cover-cards.png";
import { Link as RoutesLink, useNavigate } from "react-router-dom";
import logo from "../assets/svg/favicon.svg";
import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();


  

  const handlePasswordSubmit = () => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

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

  const handleSubmit = () => {
    const passwordOK =  handlePasswordSubmit();
    const emailOK =   handleEmailSubmit();

    if(!passwordOK || !emailOK){
      return;
    }
    try{
      setLoading(true);
      navigate('/home')
    } catch (error){

      console.log(error);

    } finally{

      setLoading(false);
    }
  };

  return (
    <>
      <AutenticationLayout
        left={
          <>
            <Typography variant="h1" sx={{ mb: 1 }}>
              Sing in
            </Typography>
            <Typography>
              Don't have an account?{" "}
              <Link component={RoutesLink} to="/singup">
                Create now
              </Link>
            </Typography>
            <BaseInputField
              label="E-mail"
              placeholder="exemple@gmail.com"
              type="email"
              error={!!emailError}
              onChange={(e) => setEmail(e.target.value)}
              helperText={emailError}
            />
            <BaseInputField
              label="Password"
              type="password"
              error={!!passwordError}
              onChange={(e) => setPassword(e.target.value)}
              helperText={passwordError}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <BaseCheckBox label="remember me" />
              <Typography>
                <Link component={RoutesLink} to="/recover-password">
                  Forgot Password?
                </Link>
              </Typography>
            </Box>
            <BaseButton
              fullWidth
              variant="contained"
              loading={false}
              onClick={() => handleSubmit()}
            >
              Sing in
            </BaseButton>
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
                  Track your finances
                </Typography>
                <Box sx={{ display: "flex", gap: "px" }}>
                  <Typography
                    color="primary"
                    sx={{ padding: "0 0px 0px 23px", minWidth: "20rem" }}
                  >
                    Manage expenses and savings with clarity. Share and explore
                    solitions and advices with other users. <br />
                    Sometimes a new perspective changes everything.
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
    </>
  );
}
