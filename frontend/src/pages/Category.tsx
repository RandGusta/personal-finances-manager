import {
  Typography,
  Box,
  Button,
} from "@mui/material";

import { useState } from "react";

import BaseNavBar from "../components/NavBar";
import CategoryTable from "../components/CategoryTable";
import CategoryModal from "../components/CategoryModal";

const Category = () => {
  const [openModal, setOpenModal] =
    useState(false);

  return (
    <>
      <BaseNavBar />

      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
          }}
        >
          <Typography variant="h4">
            Categories
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              setOpenModal(true)
            }
          >
            New Category
          </Button>
        </Box>

        <CategoryTable />

        <CategoryModal
          open={openModal}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </Box>
    </>
  );
};

export default Category;
