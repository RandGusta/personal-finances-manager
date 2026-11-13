import {Box} from "@mui/material";

interface DashboardLayoutProps{
    expensesChart: React.ReactNode,
    financialTrendChart: React.ReactNode,
    recentTransactions: React.ReactNode;
}


export function DashboardLayout({
  expensesChart,
  financialTrendChart,
  recentTransactions,
}: DashboardLayoutProps) {
  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
        {expensesChart}
        {financialTrendChart}
      </Box>

      <Box sx={{ mt: 3 }}>
        {recentTransactions}
      </Box>
    </Box>
  );
}
