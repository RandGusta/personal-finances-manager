import {Box} from "@mui/material";

interface DashboardLayoutProps{
    userSummary: React.ReactNode;
    expensesChart: React.ReactNode,
    recentTransactions: React.ReactNode;
}


export function DashboardLayout({
  userSummary,
  expensesChart,
  recentTransactions,
}: DashboardLayoutProps) {
  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: {xs:"column", lg: "row"}
        }}
      >
        <Box sx={{ flex: 1 }}>
          {userSummary}
        </Box>

        <Box sx={{ flex: 2 }}>
          {expensesChart}
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        {recentTransactions}
      </Box>
    </Box>
  );
}