import { AutenticationLayout } from "../layouts/AutenticationLayout";
import { Typography, Box, Link, LinearProgress, Card } from "@mui/material";
import { BaseInputField } from "../components/Input";
import { BaseCheckBox } from "../components/Checkbox";
import { BaseButton } from "../components/Button";
import { Link as RoutesLink, useNavigate } from "react-router-dom";
import logo from "../assets/svg/favicon.svg";
import cardImage from "../assets/images/cover-cards.png";
import zxcvbn from "zxcvbn";
import { BaseForm } from '../components/Form';
import { useState } from "react";

export function SingUp() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const passwordStrength = zxcvbn(password);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [loading, setLoading] = useState(false);

  const [passwordError, setPasswordError] = useState("");


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

  const handleNameSubmit = () =>{
    if(!name){
      setNameError("Name is required");
      return false;
    }

    let nameVector = name.split(" ");
    if(nameVector.length < 2){
      setNameError("Full Name required");
      return false;
    }

    setNameError("")
  }

  const handleSubmit = () => {
    const passwordOK =  handlePasswordSubmit();
    const emailOK =   handleEmailSubmit();
    const nameOK =   handleNameSubmit();

    if(!passwordOK || !emailOK || nameOK){
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
              Sing up
            </Typography>
            <Typography>
              Already have an account? <Link component={RoutesLink} to="/login">Login</Link>
            </Typography>
            <BaseInputField
              label="Full name"
              placeholder="Name LastName"
              error={!!nameError}
              type="email"
              onChange={(e) => setName(e.target.value)}
              helperText={nameError}
            />
            <BaseInputField
              label="E-mail"
              placeholder="exemple@gmail.com"
              type="email"
              error={!!emailError}
              onChange = {(e) => setEmail(e.target.value)}
              helperText={emailError}
            />

            <BaseInputField
              label="Password"
              placeholder="@$76exemple"
              type="password"
              error={!!passwordError}
              onChange={(e) => setPassword(e.target.value)}
              helperText={passwordError}
            />
            {password.length > 0 &&(
              <>
            <LinearProgress
              variant="determinate"
              value={
                (passwordStrength.score != 4
                  ? passwordStrength.score
                  : passwordStrength.score + 1) * 20
              }
            /> 
            <Typography>
              Password strength: {passwordStrength.score}/4
            </Typography></>)}
            <BaseButton
              fullWidth
              variant="contained"
              loading={false}
              onClick={() => handleSubmit()}
            >
              Sing up
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
