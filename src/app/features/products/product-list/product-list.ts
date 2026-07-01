import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import { FALLBACK_IMAGE } from '../../../core/api.config';
import { Category, Product } from '../../../core/api.models';
import { StoreApiService } from '../../../core/store-api.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private readonly storeApi = inject(StoreApiService);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  searchTerm = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  ngOnInit(): void {
    forkJoin({
      products: this.storeApi.getProducts(),
      categories: this.storeApi.getCategories(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ products, categories }) => {
          this.products.set(products);
          this.categories.set(categories);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar os produtos agora.');
        },
      });
  }

  filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    const categoryId = Number(this.selectedCategory);
    const min = Number(this.minPrice);
    const max = Number(this.maxPrice);

    return this.products().filter((product) => {
      const matchesTerm =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      const matchesCategory = !categoryId || product.category.id === categoryId;
      const matchesMin = !this.minPrice || product.price >= min;
      const matchesMax = !this.maxPrice || product.price <= max;

      return matchesTerm && matchesCategory && matchesMin && matchesMax;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
  }

  productImage(product: Product): string {
    return product.images[0] ?? FALLBACK_IMAGE;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
  }
}
