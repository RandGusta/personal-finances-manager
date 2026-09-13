import {Box, Drawer, List, ListItemButton, ListItemIcon, Tooltip } from "@mui/material";
import HouseRoundedIcon from '@mui/icons-material/HouseRounded';
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import WalletIcon from "@mui/icons-material/Wallet";
import logo from "../../assets/svg/navbarIcon.svg";


const navigation = [
  {
    label: "Home",
    icon: <HouseRoundedIcon sx={{color: "#F6FAFD"}} />,
  },
  {
    label: "Transactions",
    icon: <BarChartIcon sx={{color: "#F6FAFD"}} />,
  },
  {
    label: "Wallets",
    icon: <WalletIcon sx={{color: "#F6FAFD"}} />,
  },
  {
    label: "Profile",
    icon: <PersonIcon sx={{color: "#F6FAFD"}} />,
  },
    {
    label: "Categories",
    icon: <SettingsIcon  sx={{color: "#F6FAFD"}}/>,
  },
];

export function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 72,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 72,
          boxSizing: "border-box",
          backgroundColor: "#1C4632",
        },
      }}
    >
    <Box>
        <Box component="img" src={logo} sx={{ width: "1.5rem" }} />
    </Box>

      <List>
        {navigation.map((item) => (
          <Tooltip
            key={item.label}
            title={item.label}
            placement="right"
          >
            <ListItemButton>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
}