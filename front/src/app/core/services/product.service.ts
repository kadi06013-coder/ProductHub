import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFilters, ProductListResponse, ProductResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/products';

  getAll(filters: ProductFilters): Observable<ProductListResponse> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
    return this.http.get<ProductListResponse>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Product>): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.baseUrl, data);
  }

  update(id: number, data: Partial<Product>): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }
}
