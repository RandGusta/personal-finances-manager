import { useEffect, useState } from "react";
import ExpensesChart from "../components/ExpensesChart";
import { Sidebar } from "../components/new/NavBar";
import RecentTransaction from "../components/RecentTransactions";
import UserSummary from "../components/UserSummary";
import type { UserProfileResponse, WalletResponse } from "../dto/UserSummaryResponse";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { getWallets } from "../services/WalletPageService";
import { Typography, Box, Skeleton } from "@mui/material";
import { getProfilePage } from "../services/ProfileService";


const Dashboard = () => {
  const [wallets, setWallets] = useState<WalletResponse[] | null>(null);
  const [walletsError, setWalletsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  


  useEffect(() => {
    let componentIsMounted = true;


    const loadSummary = async () =>{
      try{
        const response = await getProfilePage();
        setSummary(response.profile?.name.trim());
        setSummaryError("");
        setLoading(false);
      } catch (error){
          const message = error instanceof Error ? error.message : "Error while loading user name";
          setSummaryError(message);
      }
    }

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
    loadSummary();
    loadWallets();

    return () => {
      componentIsMounted = false;
    };
  }, []);

  return (
    <>
    <Box sx={{}}>
      <Sidebar />
          <Box sx={{textAlign:"left"}}>
          <Typography
                variant="h6" sx={{color: "#000000"}}>
                Hello, {loading ? <Skeleton /> : summary}! <span>👋</span>
          </Typography>
          <Typography
                variant="h6" sx={{color: "#000000" }}>
                What you are looking for today?
          </Typography>
          </Box>
      </Box>
      <DashboardLayout
        userSummary={<UserSummary wallets={wallets} walletsError={walletsError} />}
        expensesChart={<ExpensesChart />}
        recentTransactions={
          <RecentTransaction wallets={wallets} walletsError={walletsError} />
        }
      />
    </>
  );
};

export default Dashboard;
