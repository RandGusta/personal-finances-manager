import { AppBar, Toolbar,  Box, Button, Typography, IconButton} from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../assets/svg/navbarIcon.svg";

interface NavBarProps {
  children?: React.ReactNode;
}

const BaseNavBar = ({ children }: NavBarProps) => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
            <Box sx={{display: {lg:"flex", md:"flex", xs: "none"}, gap: 7}}>
              <Box component="img" src={logo} sx={{width: "2rem"}}/>
              <Button component={Link} to="/teste" sx={{color:"#F6FAFD"}}>Profile</Button>
              <Button component={Link} to="/teste" sx={{color:"#F6FAFD"}}>Transactions</Button>
              <Button component={Link} to="/teste" sx={{color:"#F6FAFD"}}>Categories</Button>
              <Button component={Link} to="/teste" sx={{color:"#F6FAFD"}}>teste</Button>
          </Box>
          <IconButton></IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default BaseNavBar;
