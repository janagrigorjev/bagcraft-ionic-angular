import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage)
  },
  {
    path: 'orders/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/order-form/order-form.page').then(m => m.OrderFormPage)
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage)
  },
  {
    path: 'orders/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/order-form/order-form.page').then(m => m.OrderFormPage)
  },
  {
    path: 'admin/orders',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin-orders/admin-orders.page').then(m => m.AdminOrdersPage)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: '**',
    redirectTo: 'orders'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
