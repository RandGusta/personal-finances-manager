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
        backgroundColor: "#0D330E",
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
                sx={{ backgroundColor: "#A5E6A6", color: "#1C4632" }}
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
            <Typography variant="caption" sx={{ color: "#D5E6DA" }}>
              {description}
            </Typography>

            {variation && (
              <Typography variant="caption" sx={{ color: "#D5E6DA" }}>
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
