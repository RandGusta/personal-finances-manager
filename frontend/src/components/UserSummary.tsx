import { Alert, Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import profile from "../assets/svg/profile.svg";
import { useEffect, useState } from "react";
import { getUserSummary } from "../services/UserSummaryService";
import type { UserSummaryResponse } from "../dto/UserSummaryResponse";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const UserSummary = () => {
  const [summary, setSummary] = useState<UserSummaryResponse | null>(null);
  const [userError, setUserError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let componentIsMounted = true;

    const loadUserSummary = async () => {
      try {
        const response = await getUserSummary();

        if (componentIsMounted) {
          setSummary(response);
          setUserError("");
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
  }, []);

  const formatCurrency = (value: number | undefined) =>
    currencyFormatter.format(value ?? 0);

  return (
    <Card sx={{ margin: {lg:"3rem", xs:"0rem"},   width: {
          xs: "100%",
          md: "18rem",
        }, minHeight:{xs:"block", lg:"25.6rem"}, display: 'flex', flexDirection:"column"}}>
        <CardContent
          component={"img"}
          src={profile}
          sx={{ height: "10rem", padding: '0px', backgroundColor:"#1C4632"}}
        ></CardContent>
        <Box>
          <CardContent>
            {userError ? (
              <Alert severity="error">{userError}</Alert>
            ) : (
              <Typography
                variant="body2"
                sx={{ textAlign: "center", backgroundColor: "#1C4632" }}
              >
                {loading ? <Skeleton /> : summary?.userName}
              </Typography>
            )}
          </CardContent>
          <CardContent>
            <Typography variant="h3">
              Balance: {loading ? <Skeleton /> : formatCurrency(summary?.balance)}
            </Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">
              Revenue: {loading ? <Skeleton /> : formatCurrency(summary?.revenue)}
            </Typography>
          </CardContent>
          <CardContent>
            <Typography variant="h3">
              Expenses: {loading ? <Skeleton /> : formatCurrency(summary?.expenses)}
            </Typography>
          </CardContent>
        </Box>
      </Card>
  );
};

export default UserSummary;
