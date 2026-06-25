import {
  Modal,
  Box,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";

import { useState } from "react";
import { BaseInputField } from "./Input";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
}

const CategoryModal = ({
  open,
  onClose,
}: CategoryModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const handleSave = () => {
    console.log({
      name,
      type,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          width: {
            xs: "90%",
            sm: "30rem",
          },
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            mb: 3,
          }}
        >
          New Category
        </Typography>

        <BaseInputField
          label="Category Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <BaseInputField
          select
          label="Type"
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <MenuItem value="INCOME">
            Income
          </MenuItem>

          <MenuItem value="EXPENSE">
            Expense
          </MenuItem>
        </BaseInputField>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CategoryModal;