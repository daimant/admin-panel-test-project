import './ProductsPage.scss'
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProduct as apiAddProduct,
  fetchProducts,
  searchProducts,
  updateProduct as apiUpdateProduct,
} from "../../api/products";
import type { AddProductPayload, Product } from "@/types";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Pagination,
  PaginationItem,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import AddProductModal from "../../components/AddProductModal";
import EditProductModal from "../../components/EditProductModal";
import ProductTable from "../../components/ProductTable";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { RefreshIcon } from "@/assets/icons/RefreshIcon";
import ScaleIcon from "@/assets/icons/ScaleIcon.svg";
import CirclePlusIcon from "@/assets/icons/CirclePlusIcon.svg";
import { ArrowLeftIcon } from "@/assets/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/assets/icons/ArrowRightIcon";

const SORT_STORAGE_KEY = "admin_products_sort";
const DEFAULT_PAGE_SIZE = 5;

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
      if (search) return await searchProducts(search, { limit, skip });
      return await fetchProducts({ limit, skip, sortBy: sortState.sortBy, order: sortState.order });
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
    <Box className="products-container">
      <Box className='products-title-row'>
        <Typography variant="h3" className='products-title'>Товары</Typography>

        <TextField
          className="products-search"
          placeholder="Найти"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{ startAdornment: <img src={ScaleIcon} alt="search"/>, }}
        />

        <Button variant="outlined" onClick={handleLogout}>
          Выйти
        </Button>
      </Box>

      <Box className="products-controls-row">
        <Typography variant="h4" className='products-table-title'>Все позиции</Typography>

        <Box display='flex' gap={1}>
          <Tooltip title="Refresh list">
            <IconButton onClick={handleRefresh} className='products-refresh-button'>
              <RefreshIcon/>
            </IconButton>
          </Tooltip>

          <Button variant="contained" onClick={() => setAddOpen(true)} className='products-add-button'>
            <Box display='flex' gap={2}>
              <img src={CirclePlusIcon} alt='CirclePlusIcon'/>
              Добавить
            </Box>
          </Button>
        </Box>
      </Box>

      <Box className="products-table-container">
        {productsQuery.isLoading && <LinearProgress/>}

        <ProductTable
          products={products}
          onSort={handleSort}
          sortBy={sortState.sortBy}
          order={sortState.order}
          onEdit={openEdit}
        />
      </Box>

      <Box className='products-pagination'>
        <Box className='products-pagination-info'>
          <Typography component='span' color="var(--gray-color-7)">Показано</Typography>
          {products.length > 0 ? (page - 1) * limit + 1 : 0}-
          {products.length > 0 ? (page - 1) * limit + products.length : 0}
          <Typography component='span' color="var(--gray-color-7)">из</Typography>
          {total}
        </Box>

        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, value) => setPage(value)}
          shape="rounded"
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ArrowLeftIcon, next: ArrowRightIcon }}
              {...item}
            />
          )}
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
