export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock?: number;
  brand?: string;
  category?: string;
  thumbnail?: string;
  images?: string[];
  [key: string]: unknown;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuthResponse {
  id?: number;
  username?: string;
  token?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export type SortOrder = "asc" | "desc";

export interface FetchProductsParams {
  limit?: number;
  skip?: number;
  sortBy?: keyof Product | string;
  order?: SortOrder;
}

export interface AddProductPayload {
  title: string;
  price?: number;
  description?: string;
  brand?: string;
  category?: string;
  thumbnail?: string;
  images?: string[];
  [key: string]: unknown;
}

export type UpdateProductPayload = Partial<
  Pick<
    Product,
    | "title"
    | "description"
    | "price"
    | "discountPercentage"
    | "rating"
    | "stock"
    | "brand"
    | "category"
    | "thumbnail"
    | "images"
  >
>;

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
