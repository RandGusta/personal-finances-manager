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
    path: "/category",
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
          backgroundColor: "#051F20",
        },
                        "&.Mui-selected:hover": {
                  backgroundColor: "#0B2B26",
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
                color: "#DAF1DE",

                "&.Mui-selected": {
                  backgroundColor: "#235347",
                },

                "&.Mui-selected:hover": {
                  backgroundColor: "#235347",
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
