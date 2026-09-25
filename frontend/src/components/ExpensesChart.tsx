import { Alert, Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import type { CategorySummaryResponse } from "../dto/UserSummaryResponse";

type ExpensesChartProps = {
  categories: CategorySummaryResponse[] | null;
  error: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const chartColors = ["#65C76A", "#3E8B43", "#28632F", "#17491F", "#A5E6A6", "#7AB77D"];

const ExpensesChart = ({ categories, error }: ExpensesChartProps) => {
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (categories === null) {
    return <Skeleton variant="rounded" height={360} />;
  }

  const total = categories.reduce((sum, category) => sum + category.total, 0);
  const mainCategories = categories.slice(0, 5);
  const otherTotal = categories.slice(5).reduce((sum, category) => sum + category.total, 0);
  const chartCategories =
    otherTotal > 0
      ? [...mainCategories, { categoryId: null, categoryName: "Other", total: otherTotal }]
      : mainCategories;

  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const separatorSize = 5;
  let offset = 0;

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Transactions by category
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Distribution of categorized transactions across your wallets.
        </Typography>

        {chartCategories.length === 0 || total === 0 ? (
          <Alert severity="info">There are no categorized transactions to display.</Alert>
        ) : (
          <Box>
            <Box sx={{ textAlign: "center", mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {currencyFormatter.format(total)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Categorized transaction total
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <svg viewBox="0 0 220 220" width="220" height="220" aria-label="Transactions by category chart">
                {chartCategories.map((category, index) => {
                  const segmentLength = (category.total / total) * circumference;
                  const visibleSegment = Math.max(segmentLength - separatorSize, 0);
                  const circle = (
                    <circle
                      key={`${category.categoryId}-${category.categoryName}`}
                      cx="110"
                      cy="110"
                      r={radius}
                      fill="none"
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth="38"
                      strokeDasharray={`${visibleSegment} ${circumference - visibleSegment}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 110 110)"
                    />
                  );
                  offset += segmentLength;
                  return circle;
                })}
              </svg>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: 2,
                rowGap: 1,
                mt: 1,
              }}
            >
              {chartCategories.map((category, index) => (
                <Box
                  key={`${category.categoryId}-${category.categoryName}`}
                  sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                >
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  />
                  <Typography variant="caption">
                    {category.categoryName?.trim() || "Uncategorized"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesChart;
