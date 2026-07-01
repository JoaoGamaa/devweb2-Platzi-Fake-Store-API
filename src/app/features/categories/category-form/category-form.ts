import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, finalize, of } from 'rxjs';

import { FALLBACK_IMAGE } from '../../../core/api.config';
import { Category } from '../../../core/api.models';
import { PendingChangesComponent } from '../../../core/pending-changes.guard';
import { StoreApiService } from '../../../core/store-api.service';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm implements OnInit, PendingChangesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeApi = inject(StoreApiService);
  private recordId: number | null = null;

  readonly isEdit = signal(false);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    image: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.recordId = rawId ? Number(rawId) : null;
    this.isEdit.set(Boolean(this.recordId));

    const categoryRequest: Observable<Category | null> = this.recordId
      ? this.storeApi.getCategoryById(this.recordId)
      : of(null);

    categoryRequest.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (category) => {
        if (category) {
          this.form.patchValue({
            name: category.name,
            image: category.image,
          });
          this.form.markAsPristine();
        }
      },
      error: () => this.errorMessage.set('Não foi possível preparar esta categoria.'),
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
        : 'Categoria simulada com sucesso. Nenhum dado real foi criado.',
    );

    setTimeout(() => void this.router.navigate(['/categorias']), 900);
  }

  canDeactivate(): boolean {
    if (this.form.dirty && !this.saved()) {
      return confirm('Existem alterações não salvas nesta categoria. Deseja sair mesmo assim?');
    }

    return true;
  }

  controlInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  slugPreview(): string {
    const slug = this.form.controls.name.value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return slug || 'slug-da-categoria';
  }

  imagePreview(): string {
    return this.form.controls.image.value || FALLBACK_IMAGE;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
  }
}
