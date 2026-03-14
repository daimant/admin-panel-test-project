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
import type { Product } from "../types";

type FormValues = {
  title: string;
  price?: number | string;
  brand?: string;
  rating?: number | string;
  description?: string;
};

export default function EditProductModal({
  open,
  product,
  onClose,
  onSave,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (id: number, payload: Partial<Product>) => Promise<void>;
}): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      price: "",
      brand: "",
      rating: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!product) {
      reset({
        title: "",
        price: "",
        brand: "",
        rating: "",
        description: "",
      });
      return;
    }

    reset({
      title: product.title ?? "",
      price: product.price ?? "",
      brand: product.brand ?? "",
      rating: product.rating ?? "",
      description: (product.description as string) ?? "",
    });
  }, [product, reset, open]);

  async function onSubmit(values: FormValues) {
    if (!product) return;

    const payload: Partial<Product> = {
      title: (values.title ?? "").trim(),
    };

    if (values.price !== undefined && values.price !== "") {
      const priceNum =
        typeof values.price === "string" ? Number(values.price) : values.price;
      if (Number.isNaN(priceNum)) {
        setError("price", {
          type: "manual",
          message: "Price must be a number",
        });
        return;
      }
      payload.price = priceNum;
    }

    if (values.brand !== undefined)
      payload.brand = (values.brand as string).trim() || undefined;

    if (values.rating !== undefined && values.rating !== "") {
      const r =
        typeof values.rating === "string"
          ? Number(values.rating)
          : values.rating;
      if (Number.isNaN(r) || r < 0 || r > 5) {
        setError("rating", {
          type: "manual",
          message: "Rating must be a number between 0 and 5",
        });
        return;
      }
      payload.rating = r;
    }

    if (values.description !== undefined)
      payload.description = values.description.trim() || undefined;

    try {
      await onSave(product.id, payload);
      onClose();
    } catch (err: unknown) {
      setError("title", {
        type: "manual",
        message:
          err instanceof Error && err.message
            ? err.message
            : "Failed to save changes",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-product-title"
    >
      <DialogTitle id="edit-product-title">Edit product</DialogTitle>

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
              inputProps={{ "aria-label": "edit-product-title" }}
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
                "aria-label": "edit-product-price",
              }}
            />

            <TextField
              label="Vendor"
              {...register("brand")}
              error={!!errors.brand}
              helperText={errors.brand?.message}
              fullWidth
              inputProps={{ "aria-label": "edit-product-vendor" }}
            />

            <TextField
              label="Rating (0-5)"
              {...register("rating", {
                validate: (v) => {
                  if (v === "" || v === undefined) return true;
                  const n = typeof v === "string" ? Number(v) : v;
                  if (Number.isNaN(n)) return "Rating must be a number";
                  if (n < 0 || n > 5) return "Rating must be between 0 and 5";
                  return true;
                },
              })}
              error={!!errors.rating}
              helperText={errors.rating?.message}
              fullWidth
              inputProps={{
                inputMode: "decimal",
                "aria-label": "edit-product-rating",
              }}
            />

            <TextField
              label="Description"
              {...register("description")}
              multiline
              minRows={2}
              fullWidth
              inputProps={{ "aria-label": "edit-product-description" }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
