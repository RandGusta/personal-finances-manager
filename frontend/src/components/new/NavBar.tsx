import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
} from "@mui/material";

import HouseRoundedIcon from "@mui/icons-material/HouseRounded";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import WalletIcon from "@mui/icons-material/Wallet";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";

import { useLocation, useNavigate } from "react-router-dom";

const navigation = [
  {
    label: "Login",
    path: "/login",
    icon: <AccountBalanceRoundedIcon />,
  },
  {
    label: "Home",
    path: "/home",
    icon: <HouseRoundedIcon />,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: <BarChartIcon />,
  },
  {
    label: "Wallets",
    path: "/wallets",
    icon: <WalletIcon />,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <PersonIcon />,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: <CategoryIcon />,
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 72,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: 72,
          boxSizing: "border-box",
          backgroundColor: "#0D330E",
        },
                        "&.Mui-selected:hover": {
                  backgroundColor: "#051605",
                },
      }}
    >
      <List>
        {navigation.map((item) => (
          <Tooltip
            key={item.path}
            title={item.label}
            placement="right"
          >
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color: "#F6FAFD",

                "&.Mui-selected": {
                  backgroundColor: "#2D531A",
                },

                "&.Mui-selected:hover": {
                  backgroundColor: "rgb(37, 69, 22)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
}