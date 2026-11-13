import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

type MetricCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  status?: string;
  variation?: string;
};

const MetricCard = ({
  title,
  value,
  unit,
  description,
  status,
  variation,
}: MetricCardProps) => {
  return (
    <Card
      sx={{
        backgroundColor: "#163832",
        color: "#FFFFFF",
        borderRadius: 2,
        minHeight: 150,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" sx={{ color: "inherit" }}>
              {title}
            </Typography>

            {status && (
              <Chip
                label={status}
                size="small"
                sx={{ backgroundColor: "#8EB69B", color: "#0B2B26" }}
              />
            )}
          </Stack>

          <Typography variant="h5" sx={{ color: "inherit", fontWeight: 700 }}>
            {value}

            {unit && (
              <Typography component="span" variant="body2" sx={{ color: "inherit" }}>
                {" "}
                {unit}
              </Typography>
            )}
          </Typography>

          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" sx={{ color: "#DAF1DE" }}>
              {description}
            </Typography>

            {variation && (
              <Typography variant="caption" sx={{ color: "#DAF1DE" }}>
                {variation}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
