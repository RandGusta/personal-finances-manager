import { Card, CardContent, Typography, Box } from "@mui/material";
import profile from "../assets/svg/profile.svg";

const UserSummary = () => {
  return (
    <>
      <Card sx={{ margin: "3rem", maxWidth: "15rem", display: 'flex', flexDirection:"column"}}>
        <CardContent
          component={"img"}
          src={profile}
          sx={{ height: "10rem", padding: '0px'}}
        ></CardContent>
        <Box>
          <CardContent>
            <Typography variant="h4" sx={{textAlign:'center'}}>user</Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">Balance: </Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">Revenue: </Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">Expenses: </Typography>
          </CardContent>
        </Box>
      </Card>
    </>
  );
};

export default UserSummary;
