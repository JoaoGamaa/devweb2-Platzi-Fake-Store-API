import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import { FALLBACK_IMAGE } from '../../../core/api.config';
import { Category, Product } from '../../../core/api.models';
import { StoreApiService } from '../../../core/store-api.service';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly storeApi = inject(StoreApiService);

  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  searchTerm = '';
  sortBy: 'name' | 'id' | 'products' = 'name';

  ngOnInit(): void {
    forkJoin({
      categories: this.storeApi.getCategories(),
      products: this.storeApi.getProducts(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ categories, products }) => {
          this.categories.set(categories);
          this.products.set(products);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar as categorias agora.');
        },
      });
  }

  filteredCategories(): Category[] {
    const term = this.searchTerm.trim().toLowerCase();
    const categories = this.categories().filter((category) => {
      return (
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term) ||
        String(category.id).includes(term)
      );
    });

    return [...categories].sort((first, second) => {
      if (this.sortBy === 'id') {
        return first.id - second.id;
      }

      if (this.sortBy === 'products') {
        return this.productCount(second.id) - this.productCount(first.id);
      }

      return first.name.localeCompare(second.name);
    });
  }

  productCount(categoryId: number): number {
    return this.products().filter((product) => product.category.id === categoryId).length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'name';
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
  }
}
