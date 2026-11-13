import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredToken } from "../services/api";
import { validateSession } from "../services/SessionService";

type SessionCheck = {
  token: string;
  status: "valid" | "invalid" | "unavailable";
};

export default function RequireSession() {
  const token = getStoredToken();
  const location = useLocation();
  const [sessionCheck, setSessionCheck] = useState<SessionCheck | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    async function checkSession(currentToken: string) {
      try {
        const valid = await validateSession(currentToken, controller.signal);
        if (controller.signal.aborted || getStoredToken() !== currentToken) {
          return;
        }

        if (!valid) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setSessionCheck({ token: currentToken, status: "invalid" });
          return;
        }

        setSessionCheck({ token: currentToken, status: "valid" });
      } catch {
        if (!controller.signal.aborted) {
          setSessionCheck({ token: currentToken, status: "unavailable" });
        }
      }
    }

    void checkSession(token);
    return () => controller.abort();
  }, [token, retryCount]);

  if (!token || (sessionCheck?.token === token && sessionCheck.status === "invalid")) {
    const returnTo = location.pathname === "/"
      ? "/home"
      : location.pathname + location.search + location.hash;
    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  if (sessionCheck?.token === token && sessionCheck.status === "valid") {
    return <Outlet />;
  }

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
      {sessionCheck?.token === token && sessionCheck.status === "unavailable" ? (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              onClick={() => {
                setSessionCheck(null);
                setRetryCount((count) => count + 1);
              }}
            >
              Retry
            </Button>
          }
        >
          Could not verify your session. Please try again.
        </Alert>
      ) : (
        <CircularProgress aria-label="Checking your session" />
      )}
    </Box>
  );
}
