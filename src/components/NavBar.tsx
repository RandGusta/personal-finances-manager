import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import logo from "../assets/svg/navbarIcon.svg";

interface NavBarProps {
  children?: React.ReactNode;
}

const BaseNavBar = ({ children }: NavBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Desktop */}
          <Box
            sx={{
              display: {
                xs: "none",
                md: "flex",
              },
              gap: 7,
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={logo}
              sx={{ width: "2rem" }}
            />

            <Button
              component={Link}
              to="/profile"
              sx={{ color: "#F6FAFD" }}
            >
              Profile
            </Button>

            <Button
              component={Link}
              to="/transactions"
              sx={{ color: "#F6FAFD" }}
            >
              Transactions
            </Button>

            <Button
              component={Link}
              to="/categories"
              sx={{ color: "#F6FAFD" }}
            >
              Categories
            </Button>

            <Button
              component={Link}
              to="/teste"
              sx={{ color: "#F6FAFD" }}
            >
              Teste
            </Button>
          </Box>

          {/* Mobile */}
          <Box
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={logo}
              sx={{ width: "2rem" }}
            />

            <IconButton
              color="inherit"
              onClick={handleOpenMenu}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem
            component={Link}
            to="/profile"
            onClick={handleCloseMenu}
          >
            Profile
          </MenuItem>

          <MenuItem
            component={Link}
            to="/transactions"
            onClick={handleCloseMenu}
          >
            Transactions
          </MenuItem>

          <MenuItem
            component={Link}
            to="/categories"
            onClick={handleCloseMenu}
          >
            Categories
          </MenuItem>

          <MenuItem
            component={Link}
            to="/teste"
            onClick={handleCloseMenu}
          >
            Teste
          </MenuItem>
        </Menu>
      </AppBar>
    </>
  );
};

export default BaseNavBar;