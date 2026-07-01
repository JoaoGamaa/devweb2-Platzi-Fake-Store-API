import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, finalize } from 'rxjs';

import { FALLBACK_IMAGE } from '../../../core/api.config';
import { Category } from '../../../core/api.models';
import { PendingChangesComponent } from '../../../core/pending-changes.guard';
import { StoreApiService } from '../../../core/store-api.service';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit, PendingChangesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeApi = inject(StoreApiService);
  private recordId: number | null = null;

  readonly categories = signal<Category[]>([]);
  readonly isEdit = signal(false);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    price: [1, [Validators.required, Validators.min(1)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    image: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.recordId = rawId ? Number(rawId) : null;
    this.isEdit.set(Boolean(this.recordId));

    const productRequest = this.recordId ? this.storeApi.getProductById(this.recordId) : of(null);

    forkJoin({
      categories: this.storeApi.getCategories(),
      product: productRequest,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ categories, product }) => {
          this.categories.set(categories);

          if (product) {
            this.form.patchValue({
              title: product.title,
              price: product.price,
              categoryId: product.category.id,
              image: product.images[0] ?? FALLBACK_IMAGE,
              description: product.description,
            });
            this.form.markAsPristine();
          }
        },
        error: () => {
          this.errorMessage.set('Não foi possível preparar este formulário.');
        },
      });
  }

  save(): void {
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.set(true);
    this.form.markAsPristine();
    this.successMessage.set(
      this.isEdit()
        ? 'Alterações simuladas com sucesso. Nenhum dado real foi alterado.'
        : 'Produto simulado com sucesso. Nenhum dado real foi criado.',
    );

    setTimeout(() => void this.router.navigate(['/produtos']), 900);
  }

  canDeactivate(): boolean {
    if (this.form.dirty && !this.saved()) {
      return confirm('Existem alterações não salvas neste produto. Deseja sair mesmo assim?');
    }

    return true;
  }

  controlInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  selectedCategoryName(): string {
    const categoryId = Number(this.form.controls.categoryId.value);
    return this.categories().find((category) => category.id === categoryId)?.name ?? 'Sem categoria';
  }

  imagePreview(): string {
    return this.form.controls.image.value || FALLBACK_IMAGE;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
  }
}
