import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { CategoryResponse, CategoryType } from "../dto/CategoryResponse";
import { getCategories } from "../services/CategoryTableService";

type CategoryFilter = CategoryType | "ALL";

interface CategoryTableProps {
  refreshKey: number;
}

const CategoryTable = ({ refreshKey }: CategoryTableProps) => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filter, setFilter] = useState<CategoryFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentIsMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        const type = filter === "ALL" ? undefined : filter;
        const response = await getCategories(type);

        if (componentIsMounted) {
          setCategories(response);
          setError("");
        }
      } catch (requestError) {
        if (componentIsMounted) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Error occurred while loading categories";
          setCategories([]);
          setError(message);
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      componentIsMounted = false;
    };
  }, [filter, refreshKey]);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography
          variant="h5"
          sx={{
            bgcolor: "#1C4632",
            textAlign: "center",
            p: 1,
            borderRadius: 1,
          }}
        >
          Categories
        </Typography>

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel id="category-type-filter-label">Type</InputLabel>
          <Select
            labelId="category-type-filter-label"
            value={filter}
            label="Type"
            onChange={(event) => setFilter(event.target.value as CategoryFilter)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="INCOME">Income</MenuItem>
            <MenuItem value="EXPENSE">Expense</MenuItem>
          </Select>
        </FormControl>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "2fr 1fr",
            gap: 2,
            mt: 3,
          }}
        >
          <Typography variant="h6">Name</Typography>
          <Typography variant="h6">Type</Typography>
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </Box>
        )}

        {!loading && !error && categories.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            There are no categories for this filter.
          </Alert>
        )}

        {!loading &&
          categories.map((category) => (
            <Box
              key={category.id}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "2fr 1fr",
                },
                gap: 2,
                mt: 2,
                p: 2,
                borderBottom: "1px solid #ddd",
              }}
            >
              <Typography>{category.name}</Typography>

              <Chip
                label={category.type === "INCOME" ? "Income" : "Expense"}
                color={category.type === "INCOME" ? "success" : "error"}
              />
            </Box>
          ))}
      </CardContent>
    </Card>
  );
};

export default CategoryTable;
