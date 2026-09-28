import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobileNavigation = useMediaQuery(theme.breakpoints.down("md"));
  const selectedNavigationIndex = navigation.findIndex(
    (item) => item.path === location.pathname,
  );

  if (isMobileNavigation) {
    return (
      <BottomNavigation
        value={selectedNavigationIndex}
        onChange={(_, selectedIndex: number) => navigate(navigation[selectedIndex].path)}
        showLabels={false}
        aria-label="Main navigation"
        sx={{
          position: "fixed",
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: theme.zIndex.drawer + 1,
          height: 64,
          borderTop: "1px solid #8EB69B",
          backgroundColor: "#051F20",
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            px: 0.5,
            color: "#DAF1DE",
          },
          "& .MuiBottomNavigationAction-label": {
            maxWidth: "100%",
            fontSize: "0.65rem",
            lineHeight: 1.05,
            textAlign: "center",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          },
          "& .Mui-selected": {
            color: "#FFFFFF",
            backgroundColor: "#235347",
          },
        }}
      >
        {navigation.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={
              item.label === "Transactions" ? (
                <>
                  Trans<br />actions
                </>
              ) : (
                item.label
              )
            }
            icon={item.icon}
            aria-label={item.label}
          />
        ))}
      </BottomNavigation>
    );
  }

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
