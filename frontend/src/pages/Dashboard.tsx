import { useEffect, useState } from "react";
import ExpensesChart from "../components/ExpensesChart";
import BaseNavBar from "../components/NavBar";
import RecentTransaction from "../components/RecentTransactions";
import UserSummary from "../components/UserSummary";
import type { WalletResponse } from "../dto/UserSummaryResponse";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { getWallets } from "../services/WalletPageService";

const Dashboard = () => {
  const [wallets, setWallets] = useState<WalletResponse[] | null>(null);
  const [walletsError, setWalletsError] = useState("");

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
      <BaseNavBar />
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
