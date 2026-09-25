import { useCallback, useEffect, useState } from "react";
import ExpensesChart from "../components/ExpensesChart";
import FinancialTrendChart from "../components/FinancialTrendChart";
import { Sidebar } from "../components/new/NavBar";
import RecentTransaction from "../components/RecentTransactions";
import UserSummary from "../components/UserSummary";
import type { UserSummaryResponse, WalletResponse } from "../dto/UserSummaryResponse";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { getWallets } from "../services/WalletPageService";
import { Typography, Box, Skeleton } from "@mui/material";


const Dashboard = () => {
  const [wallets, setWallets] = useState<WalletResponse[] | null>(null);
  const [walletsError, setWalletsError] = useState("");
  const [userName, setUserName] = useState("");
  const [financialSummary, setFinancialSummary] = useState<UserSummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState("");

  const handleSummaryLoaded = useCallback((summary: UserSummaryResponse) => {
    setUserName(summary.userName.trim());
    setFinancialSummary(summary);
    setSummaryError("");
  }, []);

  const handleSummaryError = useCallback((message: string) => {
    setSummaryError(message);
  }, []);

  useEffect(() => {
    let componentIsMounted = true;


    const loadWallets = async () => {
      try {
        const response = await getWallets();

        if (componentIsMounted) {
          setWallets(response);
          setWalletsError("");
        }
      } catch (error) {
        if (componentIsMounted) {
          const message =
            error instanceof Error ? error.message : "Error while loading wallets";
          setWalletsError(message);
        }
      }
    };
    loadWallets();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  return (
    <>
    <Box sx={{ display: "flex" }}>
      <Sidebar />
          <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 }, textAlign: "left" }}>
          <Typography
                variant="h6" sx={{color: "#000000", fontWeight: 700}}>
                Hello, {userName || <Skeleton width={120} sx={{ display: "inline-block" }} />}! <span>🧐</span>
          </Typography>
          <Typography
                variant="h6" sx={{color: "#000000", fontWeight: 500 }}>
                What you are looking for today?
          </Typography>
          <UserSummary
            wallets={wallets}
            walletsError={walletsError}
            onLoaded={handleSummaryLoaded}
            onError={handleSummaryError}
          />
          <DashboardLayout
            expensesChart={
              <ExpensesChart
                categories={financialSummary?.categories ?? null}
                error={summaryError}
              />
            }
            financialTrendChart={
              <FinancialTrendChart
                months={financialSummary?.months ?? null}
                error={summaryError}
              />
            }
            recentTransactions={
              <RecentTransaction wallets={wallets} walletsError={walletsError} />
            }
          />
          </Box>
      </Box>
    </>
  );
};

export default Dashboard;
