import { Card, CardContent, Typography, Box } from "@mui/material";
import profile from "../assets/svg/profile.svg";

const UserSummary = () => {
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
            <Typography variant="body2" sx={{textAlign:'center', backgroundColor:"#1C4632"}}>user</Typography>
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
