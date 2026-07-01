import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FALLBACK_IMAGE } from '../../../core/api.config';
import { Category } from '../../../core/api.models';
import { StoreApiService } from '../../../core/store-api.service';

@Component({
  selector: 'app-category-delete',
  imports: [CommonModule, RouterLink],
  templateUrl: './category-delete.html',
  styleUrl: './category-delete.css',
})
export class CategoryDelete implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeApi = inject(StoreApiService);

  readonly category = signal<Category | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.storeApi
      .getCategoryById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (category) => this.category.set(category),
        error: () => this.errorMessage.set('Categoria não encontrada.'),
      });
  }

  confirmDelete(): void {
    this.successMessage.set('Exclusão simulada com sucesso. Nenhum dado real foi removido.');
    setTimeout(() => void this.router.navigate(['/categorias']), 900);
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
  }
}
