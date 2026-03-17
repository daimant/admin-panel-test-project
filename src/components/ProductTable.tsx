import React from "react";
import type { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Tooltip, Button,
} from "@mui/material";
import EditIconModule from "@mui/icons-material/Edit";
import ArrowUpwardIconModule from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIconModule from "@mui/icons-material/ArrowDownward";
import { CircleDotsIcon } from "@/assets/icons/CircleDotsIcon";
import { PlusIcon } from "@/assets/icons/PlusIcon";

const ArrowDownwardIcon = (ArrowDownwardIconModule as any)?.default ?? ArrowDownwardIconModule;
const ArrowUpwardIcon = (ArrowUpwardIconModule as any)?.default ?? ArrowUpwardIconModule;

type SortOrder = "asc" | "desc";

interface Props {
  products: Product[];
  onSort: (by: string) => void;
  sortBy?: string;
  order?: SortOrder;
  onEdit?: (product: Product) => void;
}

export default function ProductTable({ products, onSort, sortBy, order = "asc", onEdit, }: Props): JSX.Element {
  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) return null;
    return order === "asc" ? (
      <ArrowUpwardIcon fontSize="small" aria-hidden/>
    ) : (
      <ArrowDownwardIcon fontSize="small" aria-hidden/>
    );
  };

  const handleHeaderClick = (field: string) => {
    onSort(field);
  };

  if (!products || products.length === 0) {
    return (
      <Box role="status" p={2}>
        <Typography variant="body1" color="textSecondary">
          No products found.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table aria-label="Products table" size="medium">
        <TableHead>
          <TableRow>
            <TableCell
              onClick={() => handleHeaderClick("title")}
              role="button"
              tabIndex={0}
              aria-label="Sort by title"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>Наименование</Typography>
                {renderSortIndicator("title")}
              </Box>
            </TableCell>

            <TableCell
              onClick={() => handleHeaderClick("brand")}
              role="button"
              tabIndex={0}
              aria-label="Sort by vendor"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>Вендор</Typography>
                {renderSortIndicator("brand")}
              </Box>
            </TableCell>

            <TableCell
              onClick={() => handleHeaderClick("id")}
              role="button"
              tabIndex={0}
              aria-label="Sort by sku"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>Артикул</Typography>
                {renderSortIndicator("id")}
              </Box>
            </TableCell>

            <TableCell
              onClick={() => handleHeaderClick("rating")}
              role="button"
              tabIndex={0}
              aria-label="Sort by rating"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>Оценка</Typography>
                {renderSortIndicator("rating")}
              </Box>
            </TableCell>

            <TableCell
              onClick={() => handleHeaderClick("price")}
              role="button"
              tabIndex={0}
              aria-label="Sort by price"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>Цена, ₽</Typography>
                {renderSortIndicator("price")}
              </Box>
            </TableCell>

            <TableCell align="center" aria-label="Actions"></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((p) => {
            const ratingLow = typeof p.rating === "number" && p.rating < 3;
            return (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Box
                    display="flex"
                    alignItems="center"
                    className="product-cell"
                  >
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={`${p.title} thumbnail`}
                        className="product-thumb"
                      />
                    ) : null}
                    <Box>
                      <Typography className='bold-table-text'>{p.title}</Typography>
                      {p.category && (
                        <Typography variant="caption" color="textSecondary">
                          {p.category}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography className='bold-table-text open-sans-font'>{p.brand ?? "-"}</Typography>
                </TableCell>

                <TableCell>
                  <Typography className='open-sans-font'>{p.id}</Typography>
                </TableCell>

                <TableCell>
                  <Box display='flex'>
                    <Typography className={`open-sans-font rating ${ratingLow ? "low" : ""}`}>{p.rating}</Typography>
                    <Typography className='open-sans-font'>/5</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography className='roboto-font'>${p.price.toFixed(2)}</Typography>
                </TableCell>

                <TableCell align="center" className="actions">
                  <Box display='flex' gap={4}>
                    <Tooltip title="Add">
                      <Button className='product-add-button'>
                        <PlusIcon/>
                      </Button>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        aria-label={`edit-product-${p.id}`}
                        size="small"
                        onClick={() => onEdit && onEdit(p)}
                      >
                        <CircleDotsIcon/>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
