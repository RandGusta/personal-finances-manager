import { Alert, Box, Button, MenuItem, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { CategoryResponse, CategoryType } from "../dto/CategoryResponse";
import type { TransactionRequest } from "../dto/TransactionRequest";
import type { TransactionType } from "../dto/TransactionResponse";
import { getCategories } from "../services/CategoryTableService";
import { createTransaction } from "../services/TransactionModalService";
import { BaseButton } from "./Button";
import { BaseInputField } from "./Input";

interface TransactionModalProps {
  open: boolean;
  walletId: number | null;
  onClose: () => void;
  onCreated: () => void;
}

function getCurrentDate() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

const TransactionModal = ({
  open,
  walletId,
  onClose,
  onCreated,
}: TransactionModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [type, setType] = useState<TransactionType | "">("");
  const [date, setDate] = useState(getCurrentDate());
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || type === "") {
      return;
    }

    let componentIsMounted = true;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getCategories(type as CategoryType);

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
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      componentIsMounted = false;
    };
  }, [open, type]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategoryId("");
    setType("");
    setDate(getCurrentDate());
    setCategories([]);
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
    const parsedAmount = Number(amount);

    if (walletId === null) {
      setError("Select a wallet before creating a transaction");
      return;
    }

    if (type === "") {
      setError("Transaction type is required");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
      setError("Value must be at least 0.01");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    const request: TransactionRequest = {
      type,
      amount: parsedAmount,
      description: description.trim() || undefined,
      date,
      categoryId: categoryId === "" ? null : categoryId,
    };

    try {
      setSaving(true);
      setError("");
      await createTransaction(walletId, request);
      resetForm();
      onClose();
      onCreated();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error occurred while creating the transaction";
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
          maxHeight: "90vh",
          overflowY: "auto",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
          New Transaction
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <BaseInputField
          select
          label="Type"
          value={type}
          onChange={(event) => {
            setType(event.target.value as TransactionType);
            setCategoryId("");
          }}
          required
        >
          <MenuItem value="INCOME">Income</MenuItem>
          <MenuItem value="EXPENSE">Expense</MenuItem>
        </BaseInputField>

        <BaseInputField
          label="Value"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          required
        />

        <BaseInputField
          label="Date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          slotProps={{ htmlInput: { max: getCurrentDate() } }}
          required
        />

        <BaseInputField
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 255 } }}
        />

        <BaseInputField
          select
          label="Category"
          value={categoryId}
          onChange={(event) => {
            const value = event.target.value;
            setCategoryId(value === "" ? "" : Number(value));
          }}
          disabled={type === "" || categoriesLoading}
        >
          <MenuItem value="">No category</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </BaseInputField>

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

export default TransactionModal;
