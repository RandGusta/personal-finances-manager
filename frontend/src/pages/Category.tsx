import { Box, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState } from "react";
import { BaseButton } from "../components/Button";
import CategoryModal from "../components/CategoryModal";
import CategoryTable from "../components/CategoryTable";
import SidebarLayout from "../layouts/SidebarLayout";

const Category = () => {
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SidebarLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "2rem", md: "2.35rem" },
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Organize your income and expense transactions.
            </Typography>
          </Box>

          <BaseButton
            variant="contained"
            color="primary"
            icon={<AddRoundedIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Add
          </BaseButton>
        </Box>

        <CategoryTable refreshKey={refreshKey} />

        <CategoryModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={() => setRefreshKey((current) => current + 1)}
        />
      </Box>
    </SidebarLayout>
  );
};

export default Category;
