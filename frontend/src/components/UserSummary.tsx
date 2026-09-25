import { Alert, Box, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import MetricCard from "./CardDashboard";
import { getUserSummary } from "../services/UserSummaryService";
import type { UserSummaryResponse, WalletResponse } from "../dto/UserSummaryResponse";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type UserSummaryProps = {
  wallets: WalletResponse[] | null;
  walletsError: string;
  onLoaded?: (summary: UserSummaryResponse) => void;
};

const UserSummary = ({
  wallets,
  walletsError,
  onLoaded,
}: UserSummaryProps) => {
  const [summary, setSummary] = useState<UserSummaryResponse | null>(null);
  const [userError, setUserError] = useState("");
  const [loading, setLoading] = useState(true);


  

  useEffect(() => {
    let componentIsMounted = true;

    const loadUserSummary = async () => {
      if (wallets === null) {
        if (walletsError && componentIsMounted) {
          setUserError(walletsError);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getUserSummary(wallets);

        if (componentIsMounted) {
          setSummary(response);
          setUserError("");
          onLoaded?.(response);
        }
      } catch (error) {
        if (componentIsMounted) {
          const message =
            error instanceof Error
              ? error.message
              : "Error occurred while loading";
          setUserError(message);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };
    loadUserSummary();
    return () => {
      componentIsMounted = false;
    };
  }, [wallets, walletsError, onLoaded]);

  const formatCurrency = (value: number | undefined) =>
    currencyFormatter.format(value ?? 0);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
        gap: 2,
        mt: 3,
      }}
    >
      {userError ? (
        <Alert severity="error" sx={{ gridColumn: "1 / -1" }}>
          {userError}
        </Alert>
      ) : loading ? (
        <>
          <Skeleton variant="rounded" height={150} />
          <Skeleton variant="rounded" height={150} />
          <Skeleton variant="rounded" height={150} />
        </>
      ) : (
        <>
          <MetricCard
            title="Balance"
            value={formatCurrency(summary?.balance)}
            description="Available across your wallets"
          />
          <MetricCard
            title="Revenue"
            value={formatCurrency(summary?.revenue)}
            description="Total income"
          />
          <MetricCard
            title="Expenses"
            value={formatCurrency(summary?.expenses)}
            description="Total expenses"
          />
        </>
      )}
    </Box>
  );
};

export default UserSummary;
