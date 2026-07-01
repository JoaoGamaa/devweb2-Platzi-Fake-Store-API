import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FALLBACK_IMAGE } from '../../../core/api.config';
import { Product } from '../../../core/api.models';
import { StoreApiService } from '../../../core/store-api.service';

@Component({
  selector: 'app-product-delete',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-delete.html',
  styleUrl: './product-delete.css',
})
export class ProductDelete implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeApi = inject(StoreApiService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.storeApi
      .getProductById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product) => this.product.set(product),
        error: () => this.errorMessage.set('Produto não encontrado.'),
      });
  }

  confirmDelete(): void {
    this.successMessage.set('Exclusão simulada com sucesso. Nenhum dado real foi removido.');
    setTimeout(() => void this.router.navigate(['/produtos']), 900);
  }

  productImage(): string {
    return this.product()?.images[0] ?? FALLBACK_IMAGE;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
  }
}
