import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import BaseNavBar from "../components/NavBar";
import CategoryModal from "../components/CategoryModal";
import CategoryTable from "../components/CategoryTable";

const Category = () => {
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <BaseNavBar />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography variant="h4">Categories</Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenModal(true)}
          >
            New Category
          </Button>
        </Box>

        <CategoryTable refreshKey={refreshKey} />

        <CategoryModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={() => setRefreshKey((current) => current + 1)}
        />
      </Box>
    </>
  );
};

export default Category;
