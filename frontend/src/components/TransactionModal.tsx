import {
  Modal,
  Box,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";

import { useState } from "react";
import { BaseInputField } from "./Input";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const TransactionModal = ({
  open,
  onClose,
}: TransactionModalProps) => {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const handleSave = () => {
    console.log({
      description,
      value,
      category,
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
            mb: 2,
            textAlign: "center",
          }}
        >
          New Transaction
        </Typography>

        <BaseInputField
          label="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <BaseInputField
          label="Value"
          type="number"
          value={value}
          onChange={(e) =>
            setValue(e.target.value)
          }
        />

        <BaseInputField
          select
          label="Category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <MenuItem value="Food">
            Food
          </MenuItem>

          <MenuItem value="Health">
            Health
          </MenuItem>

          <MenuItem value="Transport">
            Transport
          </MenuItem>

          <MenuItem value="Entertainment">
            Entertainment
          </MenuItem>

          <MenuItem value="Salary">
            Salary
          </MenuItem>
        </BaseInputField>

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

export default TransactionModal;