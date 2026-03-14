import axios from "axios";
import type {
  Product,
  ProductsResponse,
  FetchProductsParams,
  AddProductPayload,
  UpdateProductPayload,
} from "../types";

const BASE_URL = "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

function toError(err: unknown, fallback = "Products API error"): Error {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const serverMsg =
      (err.response?.data &&
        (err.response?.data.message || err.response?.data.error)) ||
      err.response?.statusText;
    const parts = [fallback];
    if (serverMsg) parts.push(String(serverMsg));
    if (status) parts.push(`(status: ${status})`);
    return new Error(parts.join(" — "));
  }
  return new Error(fallback + (err ? ` — ${String(err)}` : ""));
}

export async function fetchProducts(
  params?: FetchProductsParams,
): Promise<ProductsResponse> {
  try {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.skip != null) qs.set("skip", String(params.skip));
    if (params?.sortBy) qs.set("sortBy", String(params.sortBy));
    if (params?.order) qs.set("order", String(params.order));
    const url = qs.toString() ? `/products?${qs.toString()}` : "/products";
    const res = await api.get<ProductsResponse>(url);
    return res.data;
  } catch (err) {
    throw toError(err, "Failed to fetch products");
  }
}

export async function searchProducts(
  q: string,
  options?: { limit?: number; skip?: number },
): Promise<ProductsResponse> {
  try {
    const qs = new URLSearchParams();
    qs.set("q", q);
    if (options?.limit != null) qs.set("limit", String(options.limit));
    if (options?.skip != null) qs.set("skip", String(options.skip));
    const url = `/products/search?${qs.toString()}`;
    const res = await api.get<ProductsResponse>(url);
    return res.data;
  } catch (err) {
    throw toError(err, "Failed to search products");
  }
}

export async function getProduct(id: number): Promise<Product> {
  try {
    const res = await api.get<{ id: number } & Product>(`/products/${id}`);
    return res.data as Product;
  } catch (err) {
    throw toError(err, `Failed to fetch product with id=${id}`);
  }
}

export async function addProduct(payload: AddProductPayload): Promise<Product> {
  try {
    const res = await api.post<Product>("/products/add", payload);
    return res.data;
  } catch (err) {
    throw toError(err, "Failed to add product");
  }
}

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  try {
    const res = await api.put<Product>(`/products/${id}`, payload);
    return res.data;
  } catch (err) {
    throw toError(err, `Failed to update product with id=${id}`);
  }
}

export async function deleteProduct(id: number): Promise<any> {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (err) {
    throw toError(err, `Failed to delete product with id=${id}`);
  }
}
