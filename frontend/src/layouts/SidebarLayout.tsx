import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Sidebar } from "../components/NavBar";

type SidebarLayoutProps = {
  children: ReactNode;
};

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pb: { xs: 10, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout;
