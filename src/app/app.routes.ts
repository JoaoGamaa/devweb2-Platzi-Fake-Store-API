import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { pendingChangesGuard } from './core/pending-changes.guard';
import { Shell } from './layout/shell/shell';
import { Login } from './features/auth/login/login';
import { ProductList } from './features/products/product-list/product-list';
import { ProductForm } from './features/products/product-form/product-form';
import { ProductDelete } from './features/products/product-delete/product-delete';
import { CategoryList } from './features/categories/category-list/category-list';
import { CategoryForm } from './features/categories/category-form/category-form';
import { CategoryDelete } from './features/categories/category-delete/category-delete';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'produtos' },
      { path: 'produtos', component: ProductList },
      {
        path: 'produtos/novo',
        component: ProductForm,
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'produtos/:id/editar',
        component: ProductForm,
        canDeactivate: [pendingChangesGuard],
      },
      { path: 'produtos/:id/excluir', component: ProductDelete },
      { path: 'categorias', component: CategoryList },
      {
        path: 'categorias/nova',
        component: CategoryForm,
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'categorias/:id/editar',
        component: CategoryForm,
        canDeactivate: [pendingChangesGuard],
      },
      { path: 'categorias/:id/excluir', component: CategoryDelete },
    ],
  },
  { path: '**', redirectTo: '' },
];
