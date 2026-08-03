import { Card, CardContent, Typography, Box, Alert } from "@mui/material";
import profile from "../assets/svg/profile.svg";
import { use, useState } from "react";
import { getCurrentUserInform } from "../services/UserService";
import { useEffect } from "react";

const UserSummary = () => {
  const [balance, setBalance] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [userName, setUserName] = useState("");
  const [userError, setUserError] = useState("");

  useEffect(() =>{
    handleUserInformation();
  },[]);

  const handleUserInformation = async () => {
    try{
      await getCurrentUserInform();
    } catch (error){
      if(error instanceof Error){
        setUserError(error.message);
      }
      else {
        setUserError("Error occurred while loading");
      }
    }
  }



  return (
    <>
      <Card sx={{ margin: {lg:"3rem", xs:"0rem"},   width: {
          xs: "100%",
          md: "18rem",
        }, minHeight:{xs:"block", lg:"25.6rem"}, display: 'flex', flexDirection:"column"}}>
        <CardContent
          component={"img"}
          src={profile}
          sx={{ height: "10rem", padding: '0px', backgroundColor:"#1C4632"}}
        ></CardContent>
        <Box>
          <CardContent>
            <Typography variant="body2" sx={{textAlign:'center', backgroundColor:"#1C4632"}}>{userError ? <Alert severity="error">{userError}</Alert>: <p>{userName}</p>}</Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">Balance: {balance && <p>{balance}</p>}</Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">Revenue: {revenue && <p>{revenue}</p>}</Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">Expenses: {expenses && <p>{expenses}</p>} </Typography>
          </CardContent>
        </Box>
      </Card>
    </>
  );
};

export default UserSummary;
