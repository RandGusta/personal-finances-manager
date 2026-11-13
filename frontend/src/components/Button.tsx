import { Button, CircularProgress, type ButtonProps } from "@mui/material";
import type { ReactNode } from "react";

interface BaseButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
}

export const BaseButton = ({
  children,
  loading = false,
  disabled,
  sx,
  icon,
  iconPosition = "start",
  startIcon,
  endIcon,
  ...props
}: BaseButtonProps) => {
  const resolvedStartIcon =
    !loading && iconPosition === "start" ? icon ?? startIcon : startIcon;
  const resolvedEndIcon =
    !loading && iconPosition === "end" ? icon ?? endIcon : endIcon;

  return (
    <Button
      {...props}
      disableElevation
      disabled={loading || disabled}
      startIcon={resolvedStartIcon}
      endIcon={resolvedEndIcon}
      sx={[
        {
          minHeight: 42,
          px: 2.5,
          borderRadius: 1.5,
          fontWeight: 700,
          letterSpacing: "0.01em",
          textTransform: "none",
          transition: "background-color 160ms ease, transform 160ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            opacity: 0.55,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {loading ? <CircularProgress size={18} color="inherit" /> : children}
    </Button>
  );
};
