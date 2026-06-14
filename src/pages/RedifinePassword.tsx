import { AutenticationLayout } from "../layouts/AutenticationLayout";
import { Box, Typography, Card, Link, LinearProgress } from "@mui/material";
import cardImage from "../assets/images/cover-cards.png";
import zxcvbn from "zxcvbn";
import { useState } from "react";
import { BaseButton } from "../components/Button";
import { BaseInputField } from "../components/Input";
import { BaseForm } from "../components/Form";

const RedifinePassword = () => {
  const [password, setPassword] = useState("");
  const passwordStrength = zxcvbn(password);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    console.log("enviado");
  };
  return (
    <>
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
                  top: { xs: "6rem", lg: "5rem", md: "24rem", sm: "20rem" },
                  left: { xs: "5rem", lg: "16rem", md: "29rem" },
                }}
              >
                Redifine password
              </Typography>
            </Box>
            <Box sx={{ marginTop: "10rem" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
               
                  <BaseForm onSubmit={handleSubmit}>
                   <Box sx={{display:"flex", flexDirection: "column", gap: 3}}>
                    <BaseInputField
                      label="password"
                      placeholder="@$76exemple"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <BaseInputField
                      label="confirm password"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    </Box>

                    <BaseButton
                      fullWidth
                      type="submit"
                      variant="contained"
                      loading={false}
                      sx={{ marginTop: 10, marginBottom: 3 }}
                      onClick={() => console.log("teste")}
                    >
                      confirm
                    </BaseButton>
                  </BaseForm>
                </Box>
                <Typography>
                  <Link href="">Return to Login</Link>
                </Typography>
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
                    variant="body2"
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
    </>
  );
};

export default RedifinePassword;
