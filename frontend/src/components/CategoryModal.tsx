import { Alert, Box, Button, MenuItem, Modal, Typography } from "@mui/material";
import { useState } from "react";
import type { CategoryRequest } from "../dto/CategoryRequest";
import type { CategoryType } from "../dto/CategoryResponse";
import { createCategory } from "../services/CategoryModalService";
import { BaseButton } from "./Button";
import { BaseInputField } from "./Input";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const DEFAULT_COLOR = "#1C4632";
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const CategoryModal = ({
  open,
  onClose,
  onCreated,
}: CategoryModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType | "">("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setType("");
    setColor(DEFAULT_COLOR);
    setError("");
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Category name is required");
      return;
    }

    if (normalizedName.length > 80) {
      setError("Category name must have at most 80 characters");
      return;
    }

    if (type === "") {
      setError("Category type is required");
      return;
    }

    if (!HEX_COLOR_PATTERN.test(color)) {
      setError("Color must be a valid hexadecimal value, such as #FF5733");
      return;
    }

    const request: CategoryRequest = {
      name: normalizedName,
      type,
      color,
    };

    try {
      setSaving(true);
      setError("");
      await createCategory(request);
      resetForm();
      onClose();
      onCreated();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error occurred while creating the category";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          width: { xs: "90%", sm: "30rem" },
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
          New Category
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <BaseInputField
          label="Category Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 80 } }}
          required
        />

        <BaseInputField
          select
          label="Type"
          value={type}
          onChange={(event) => setType(event.target.value as CategoryType)}
          required
        >
          <MenuItem value="INCOME">Income</MenuItem>
          <MenuItem value="EXPENSE">Expense</MenuItem>
        </BaseInputField>

        <BaseInputField
          label="Color"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          required
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>

          <BaseButton variant="contained" onClick={handleSave} loading={saving}>
            Save
          </BaseButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default CategoryModal;
