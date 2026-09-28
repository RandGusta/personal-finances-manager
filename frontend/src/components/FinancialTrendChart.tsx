import { Alert, Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import type { MonthlySummaryResponse } from "../dto/UserSummaryResponse";

type FinancialTrendChartProps = {
  months: MonthlySummaryResponse[] | null;
  error: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

const FinancialTrendChart = ({ months, error }: FinancialTrendChartProps) => {
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (months === null) {
    return <Skeleton variant="rounded" height={400} />;
  }

  const chartMonths = months.slice(-6);

  if (chartMonths.length === 0) {
    return (
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Income vs expenses
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your monthly financial movement.
          </Typography>
          <Alert severity="info">There are no transactions to display over time.</Alert>
        </CardContent>
      </Card>
    );
  }

  const chartWidth = 520;
  const chartHeight = 210;
  const leftPadding = 16;
  const rightPadding = 16;
  const topPadding = 18;
  const bottomPadding = 36;
  const chartAreaHeight = chartHeight - topPadding - bottomPadding;
  const chartAreaWidth = chartWidth - leftPadding - rightPadding;
  const highestValue = Math.max(
    ...chartMonths.flatMap((month) => [month.income, month.expense]),
    1,
  );

  const pointX = (index: number) => {
    if (chartMonths.length === 1) {
      return chartWidth / 2;
    }

    return leftPadding + (index / (chartMonths.length - 1)) * chartAreaWidth;
  };

  const pointY = (value: number) =>
    topPadding + chartAreaHeight - (value / highestValue) * chartAreaHeight;

  const createPath = (field: "income" | "expense") =>
    chartMonths
      .map((month, index) => `${index === 0 ? "M" : "L"}${pointX(index)} ${pointY(month[field])}`)
      .join(" ");

  const averageIncome =
    chartMonths.reduce((sum, month) => sum + month.income, 0) / chartMonths.length;
  const averageExpense =
    chartMonths.reduce((sum, month) => sum + month.expense, 0) / chartMonths.length;

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Income vs expenses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comparison of your monthly financial movement.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
            textAlign: "center",
            my: 2,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {currencyFormatter.format(averageIncome)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Average income
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {currencyFormatter.format(averageExpense)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Average expenses
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto", pb: 0.5 }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width={chartWidth}
            style={{ display: "block" }}
            role="img"
            aria-label="Monthly income and expenses chart"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((position) => {
              const y = topPadding + chartAreaHeight - position * chartAreaHeight;

              return (
                <line
                  key={position}
                  x1={leftPadding}
                  x2={chartWidth - rightPadding}
                  y1={y}
                  y2={y}
                  stroke="#8EB69B"
                  strokeDasharray="4 4"
                />
              );
            })}

            <path d={createPath("income")} fill="none" stroke="#235347" strokeWidth="3" />
            <path d={createPath("expense")} fill="none" stroke="#57192E" strokeWidth="3" />

            {chartMonths.map((month, index) => (
              <g key={month.month}>
                <circle cx={pointX(index)} cy={pointY(month.income)} r="4" fill="#235347" />
                <circle cx={pointX(index)} cy={pointY(month.expense)} r="4" fill="#57192E" />
                <text
                  x={pointX(index)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fill="#235347"
                  fontSize="11"
                >
                  {formatMonth(month.month)}
                </text>
              </g>
            ))}
          </svg>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#235347" }} />
            <Typography variant="caption">Income</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#57192E" }} />
            <Typography variant="caption">Expenses</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialTrendChart;
