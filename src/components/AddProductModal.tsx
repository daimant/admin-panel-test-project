import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import type { AddProductPayload } from "../types";

type FormValues = {
  title: string;
  price?: number | string;
  brand?: string;
  id?: number | string;
  description?: string;
};

export default function AddProductModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: AddProductPayload) => Promise<void>;
}): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      price: "",
      brand: "",
      id: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    const payload: AddProductPayload = {
      title: (values.title || "").trim(),
    };

    if (values.price !== undefined && values.price !== "") {
      const priceNum =
        typeof values.price === "string"
          ? parseFloat(values.price)
          : values.price;
      if (!Number.isNaN(priceNum)) payload.price = priceNum;
    }

    if (values.brand) payload.brand = values.brand.trim();
    if (values.description) payload.description = values.description?.trim();

    if (values.id !== undefined && values.id !== "") {
      const idNum =
        typeof values.id === "string" ? parseInt(values.id, 10) : values.id;
      if (!Number.isNaN(idNum)) {
        (payload as any).id = idNum;
      }
    }

    await onAdd(payload);
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="add-product-title"
    >
      <DialogTitle id="add-product-title">Add product</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Title"
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
              autoFocus
              inputProps={{ "aria-label": "product-title" }}
            />

            <TextField
              label="Price"
              {...register("price", {
                validate: (v) => {
                  if (v === "" || v === undefined) return true;
                  const n = typeof v === "string" ? Number(v) : v;
                  if (Number.isNaN(n)) return "Price must be a number";
                  if (n < 0) return "Price must be >= 0";
                  return true;
                },
              })}
              error={!!errors.price}
              helperText={errors.price?.message}
              fullWidth
              inputProps={{
                inputMode: "decimal",
                "aria-label": "product-price",
              }}
            />

            <TextField
              label="Vendor"
              {...register("brand")}
              error={!!errors.brand}
              helperText={errors.brand?.message}
              fullWidth
              inputProps={{ "aria-label": "product-vendor" }}
            />

            <TextField
              label="SKU / Article (id)"
              {...register("id", {
                validate: (v) => {
                  if (v === "" || v === undefined) return true;
                  const n = typeof v === "string" ? Number(v) : v;
                  if (!Number.isInteger(n)) return "SKU must be an integer";
                  if (n < 0) return "SKU must be >= 0";
                  return true;
                },
              })}
              error={!!errors.id}
              helperText={
                errors.id?.message ||
                "Optional — dummy API will simulate ID if omitted"
              }
              fullWidth
              inputProps={{ inputMode: "numeric", "aria-label": "product-sku" }}
            />

            <TextField
              label="Description"
              {...register("description")}
              multiline
              minRows={2}
              fullWidth
              inputProps={{ "aria-label": "product-description" }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              reset();
              onClose();
            }}
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
