export interface Product {
  id: number;
  category_id: number | null;
  category_name: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  image_url: string | null;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductStats {
  total: number;
  active: number;
  out_of_stock: number;
}

export interface ProductStatsResponse {
  success: boolean;
  data: ProductStats;
}

export interface ProductFilters {
  page: number;
  limit: number;
  search?: string;
  is_active?: 0 | 1;
}
