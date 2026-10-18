import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Modal,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useState } from "react";
import type { CategoryResponse, CategoryType } from "../dto/CategoryResponse";
import type { TransactionRequest } from "../dto/TransactionRequest";
import type { TransactionResponse, TransactionType } from "../dto/TransactionResponse";
import { getCategories } from "../services/CategoryTableService";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../services/TransactionModalService";
import { BaseButton } from "./Button";
import CategoryModal from "./CategoryModal";
import { BaseInputField } from "./Input";

interface TransactionModalProps {
  open: boolean;
  walletId: number | null;
  onClose: () => void;
  onSaved: () => void;
  transaction?: TransactionResponse | null;
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
  onSaved,
  transaction = null,
}: TransactionModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [type, setType] = useState<TransactionType | "">("");
  const [date, setDate] = useState(getCurrentDate());
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = transaction !== null;

  useEffect(() => {
    if (!open || type === "") {
      return;
    }

    let componentIsMounted = true;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesLoaded(false);
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
          setCategoriesLoaded(true);
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      componentIsMounted = false;
    };
  }, [open, type]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (transaction === null) {
      setDescription("");
      setAmount("");
      setCategoryId("");
      setType("");
      setDate(getCurrentDate());
      return;
    }

    setDescription(transaction.description ?? "");
    setAmount(transaction.amount.toString());
    setCategoryId(transaction.categoryId ?? "");
    setType(transaction.type);
    setDate(transaction.date);
  }, [open, transaction]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategoryId("");
    setType("");
    setDate(getCurrentDate());
    setCategories([]);
    setCategoriesLoaded(false);
    setError("");
  };

  const handleClose = () => {
    if (saving || deleting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount);

    if (walletId === null) {
      setError("Select a wallet before saving a transaction");
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

    if (categoryId === "") {
      setError("Category is required");
      return;
    }

    const request: TransactionRequest = {
      type,
      amount: parsedAmount,
      description: description.trim() || undefined,
      date,
      categoryId,
    };

    try {
      setSaving(true);
      setError("");
      if (transaction === null) {
        await createTransaction(walletId, request);
      } else {
        await updateTransaction(walletId, transaction.id, request);
      }
      resetForm();
      onClose();
      onSaved();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error occurred while saving the transaction";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (walletId === null || transaction === null) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await deleteTransaction(walletId, transaction.id);
      setOpenDeleteDialog(false);
      resetForm();
      onClose();
      onSaved();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Error occurred while deleting the transaction";
      setError(message);
      setOpenDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
          p: { xs: 2.5, sm: 4 },
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
          {isEditing ? "Edit Transaction" : "New Transaction"}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <BaseInputField
          select
          label="Type"
          value={type}
          onChange={(event) => {
            setType(event.target.value as TransactionType);
            setCategoryId("");
            setCategories([]);
            setCategoriesLoaded(false);
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
          <MenuItem value="" disabled>
            Select a category
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </BaseInputField>

        {type !== "" && categoriesLoaded && categories.length === 0 && (
          <BaseButton
            variant="outlined"
            icon={<AddRoundedIcon />}
            onClick={() => setOpenCategoryModal(true)}
            sx={{ mt: 1 }}
          >
            Add category
          </BaseButton>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          {isEditing && (
            <BaseButton
              variant="outlined"
              color="error"
              icon={<DeleteOutlineRoundedIcon />}
              onClick={() => setOpenDeleteDialog(true)}
              disabled={saving}
            >
              Delete
            </BaseButton>
          )}
          <Button variant="outlined" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>

          <BaseButton
            variant="contained"
            icon={isEditing ? <EditRoundedIcon /> : <AddRoundedIcon />}
            onClick={handleSave}
            loading={saving}
          >
            {isEditing ? "Save changes" : "Add"}
          </BaseButton>
        </Box>
      </Box>
    </Modal>
    <Dialog
      open={openDeleteDialog}
      onClose={() => {
        if (!deleting) {
          setOpenDeleteDialog(false);
        }
      }}
    >
      <DialogTitle>Delete transaction?</DialogTitle>
      <DialogContent>
        <Typography>This transaction will be permanently deleted.</Typography>
      </DialogContent>
      <DialogActions>
        <BaseButton
          variant="outlined"
          icon={<CloseRoundedIcon />}
          onClick={() => setOpenDeleteDialog(false)}
          disabled={deleting}
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="contained"
          color="error"
          icon={<DeleteOutlineRoundedIcon />}
          onClick={handleDelete}
          loading={deleting}
        >
          Delete
        </BaseButton>
      </DialogActions>
    </Dialog>
    <CategoryModal
      open={openCategoryModal}
      fixedType={type === "" ? undefined : type}
      onClose={() => setOpenCategoryModal(false)}
      onCreated={(createdCategory) => {
        setCategories([createdCategory]);
        setCategoryId(createdCategory.id);
        setCategoriesLoaded(true);
        setOpenCategoryModal(false);
      }}
    />
    </>
  );
};

export default TransactionModal;
