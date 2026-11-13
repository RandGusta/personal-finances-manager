import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getMonthlyFinancialInsight } from "../services/FinancialInsightService";
import { BaseButton } from "./Button";

const FinancialInsight = () => {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateInsight = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMonthlyFinancialInsight();
      setInsight(response.insight);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error while generating the financial insight";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#163832" }}>
              Monthly financial insight
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate a short suggestion from this month&apos;s aggregated data.
            </Typography>
          </Box>

          <BaseButton
            variant="outlined"
            icon={<AutoAwesomeOutlinedIcon />}
            onClick={handleGenerateInsight}
            loading={loading}
          >
            Generate insight
          </BaseButton>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {insight && !error && (
          <Box
            sx={{
              mt: 2,
              typography: "body2",
              lineHeight: 1.7,
              overflowWrap: "anywhere",
              "& p": { my: 1 },
              "& ul, & ol": { pl: 3, my: 1 },
              "& li": { mb: 0.75 },
              "& strong": { fontWeight: 700 },
            }}
          >
            <ReactMarkdown
              skipHtml
              allowedElements={["p", "strong", "em", "ul", "ol", "li", "br", "code"]}
              unwrapDisallowed
            >
              {insight}
            </ReactMarkdown>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialInsight;
