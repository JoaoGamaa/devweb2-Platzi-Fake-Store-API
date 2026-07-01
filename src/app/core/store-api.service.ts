import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL, FALLBACK_IMAGE } from './api.config';
import { Category, Product } from './api.models';

@Injectable({ providedIn: 'root' })
export class StoreApiService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${API_BASE_URL}/products`, { params: { offset: 0, limit: 80 } })
      .pipe(map((products) => products.map((product) => this.normalizeProduct(product))));
  }

  getProductById(id: number): Observable<Product> {
    return this.http
      .get<Product>(`${API_BASE_URL}/products/${id}`)
      .pipe(map((product) => this.normalizeProduct(product)));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${API_BASE_URL}/categories`)
      .pipe(map((categories) => categories.map((category) => this.normalizeCategory(category))));
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http
      .get<Category>(`${API_BASE_URL}/categories/${id}`)
      .pipe(map((category) => this.normalizeCategory(category)));
  }

  private normalizeProduct(product: Product): Product {
    return {
      ...product,
      category: this.normalizeCategory(product.category),
      images: this.normalizeImages(product.images),
    };
  }

  private normalizeCategory(category: Category): Category {
    return {
      ...category,
      image: this.cleanImageUrl(category.image),
    };
  }

  private normalizeImages(images: string[] | undefined): string[] {
    const cleanImages = (images ?? []).map((image) => this.cleanImageUrl(image)).filter(Boolean);
    return cleanImages.length ? cleanImages : [FALLBACK_IMAGE];
  }

  private cleanImageUrl(value: string | undefined): string {
    if (!value) {
      return FALLBACK_IMAGE;
    }

    return value.replace(/^\["?/, '').replace(/"?\]$/, '').trim() || FALLBACK_IMAGE;
  }
}
