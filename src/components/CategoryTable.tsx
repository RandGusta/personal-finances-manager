import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

export interface Category {
  id: number;
  name: string;
  transactionsCount: number;
  type: "INCOME" | "EXPENSE";
}

interface CategoryTableProps {
  categories: Category[];
}

const CategoryTable = ({
  categories,
}: CategoryTableProps) => {
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr 1fr",
            },
            gap: 2,
            mt: 3,
          }}
        >
          <Typography variant="h6">
            Name
          </Typography>

          <Typography variant="h6">
            Transactions
          </Typography>

          <Typography variant="h6">
            Type
          </Typography>
        </Box>

        {categories.map((category) => (
          <Box
            key={category.id}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "2fr 1fr 1fr",
              },
              gap: 2,
              mt: 2,
              p: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography>
              {category.name}
            </Typography>

            <Typography>
              {category.transactionsCount}
            </Typography>

            <Chip
              label={category.type}
              color={
                category.type === "INCOME"
                  ? "success"
                  : "error"
              }
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default CategoryTable;