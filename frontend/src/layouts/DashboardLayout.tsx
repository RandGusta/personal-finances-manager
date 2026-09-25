import {Box} from "@mui/material";

interface DashboardLayoutProps{
    expensesChart: React.ReactNode,
    recentTransactions: React.ReactNode;
}


export function DashboardLayout({
  expensesChart,
  recentTransactions,
}: DashboardLayoutProps) {
  return (
    <Box sx={{ mt: 3 }}>
      <Box>
        {expensesChart}
      </Box>

      <Box sx={{ mt: 3 }}>
        {recentTransactions}
      </Box>
    </Box>
  );
}
