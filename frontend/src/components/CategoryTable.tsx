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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: "1px solid #E2E8E3" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1C4632" }}>
            Category list
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter and review the categories available to your account.
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
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
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <TableContainer>
          <Table size="small" aria-label="Category list" sx={{ tableLayout: "fixed" }}>
            <TableHead sx={{ backgroundColor: "#F3F8F4" }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 700, color: "#1C4632" }}>
                  Name
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "#1C4632" }}>
                  Type
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell align="center"><Skeleton sx={{ mx: "auto" }} width="55%" /></TableCell>
                    <TableCell align="center"><Skeleton sx={{ mx: "auto" }} width="40%" /></TableCell>
                  </TableRow>
                ))}

              {!loading && !error && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} sx={{ py: 3, textAlign: "center" }}>
                    <Alert severity="info">There are no categories for this filter.</Alert>
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && categories.map((category) => (
                <TableRow key={category.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={category.type === "INCOME" ? "Income" : "Expense"}
                      size="small"
                      color={category.type === "INCOME" ? "success" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryTable;
