import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  searchProducts,
  addProduct as apiAddProduct,
  updateProduct as apiUpdateProduct,
} from "../api/products";
import type { Product, AddProductPayload } from "../types";
import { Box, Typography, Button, TextField, LinearProgress, IconButton, Tooltip, Pagination } from "@mui/material";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import ProductTable from "../components/ProductTable";
import { useSnackbar } from "notistack";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RefreshIcon: React.FC = () => (
  <span aria-hidden="true" style={{ fontSize: "1.2em" }}>
    ⟳
  </span>
);

const SORT_STORAGE_KEY = "admin_products_sort";
const DEFAULT_PAGE_SIZE = 10;

type SortState = {
  sortBy?: string;
  order: "asc" | "desc";
};

export default function ProductsPage(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sortState, setSortState] = useState<SortState>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(SORT_STORAGE_KEY)
          : null;
      if (!raw) return { sortBy: undefined, order: "asc" };
      const parsed = JSON.parse(raw) as SortState;
      return { sortBy: parsed.sortBy, order: parsed.order ?? "asc" };
    } catch {
      return { sortBy: undefined, order: "asc" };
    }
  });

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sortState));
  }, [sortState]);

  const productsQuery = useQuery(
    [
      "products",
      { page, limit, sortBy: sortState.sortBy, order: sortState.order, search },
    ],
    async () => {
      const skip = (page - 1) * limit;
      if (search) {
        const res = await searchProducts(search, { limit, skip });
        return res;
      }
      const res = await fetchProducts({
        limit,
        skip,
        sortBy: sortState.sortBy,
        order: sortState.order,
      });
      return res;
    },
    {
      keepPreviousData: true,
      staleTime: 1000 * 15,
    },
  );

  const products = useMemo(
    () => productsQuery.data?.products ?? [],
    [productsQuery.data],
  );
  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function handleSort(by: string) {
    setSortState((prev) => {
      if (prev.sortBy === by) {
        return { sortBy: by, order: prev.order === "asc" ? "desc" : "asc" };
      }
      return { sortBy: by, order: "asc" };
    });
    setPage(1);
  }

  async function handleAdd(payload: AddProductPayload) {
    try {
      const body = {
        title: String(payload.title ?? "Untitled"),
        price: payload.price,
        brand: payload.brand,
        description: payload.description,
      };
      await apiAddProduct(body);
      enqueueSnackbar("Product added", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      enqueueSnackbar("Failed to add product", { variant: "error" });
      throw err;
    }
  }

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function openEdit(product: Product) {
    setEditingProduct(product);
    setEditOpen(true);
  }

  async function handleSave(id: number, payload: Partial<Product>) {
    try {
      await apiUpdateProduct(id, payload);
      enqueueSnackbar("Product updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditOpen(false);
      setEditingProduct(null);
    } catch (err) {
      enqueueSnackbar("Update failed", { variant: "error" });
      throw err;
    }
  }

  async function handleRefresh() {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    enqueueSnackbar("Refreshing products", { variant: "info" });
  }

  function handleLogout() {
    try {
      logout();
      enqueueSnackbar("Logged out", { variant: "info" });
    } catch {
    }
    navigate("/login");
  }

  return (
    <Box className="app-container">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="h4">Products</Typography>

        <Box display="flex" gap={1} alignItems="center">
          <Tooltip title="Refresh list">
            <IconButton
              aria-label="refresh-products"
              onClick={handleRefresh}
              size="large"
            >
              <RefreshIcon/>
            </IconButton>
          </Tooltip>

          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      <Box className="controls-row" mt={2}>
        <TextField
          className="search"
          label="Search products"
          placeholder="Search by title, category, ... (uses API)"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Button variant="contained" onClick={() => setAddOpen(true)}>
          Add
        </Button>
      </Box>

      <Box className="table-container" mt={2}>
        {productsQuery.isLoading && <LinearProgress/>}

        <ProductTable
          products={products}
          onSort={handleSort}
          sortBy={sortState.sortBy}
          order={sortState.order}
          onEdit={openEdit}
        />
      </Box>

      <Box
        mt={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="body2" color="textSecondary">
          Showing {products.length > 0 ? (page - 1) * limit + 1 : 0} -
          {products.length > 0 ? (page - 1) * limit + products.length : 0} of{" "}
          {total}
        </Typography>

        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, value) => setPage(value)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>

      <EditProductModal
        open={editOpen}
        product={editingProduct}
        onClose={() => {
          setEditOpen(false);
          setEditingProduct(null);
        }}
        onSave={async (id, payload) => await handleSave(id, payload)}
      />

      <AddProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={async (payload) => handleAdd(payload)}
      />
    </Box>
  );
}
