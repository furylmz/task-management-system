import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(component => component.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(component => component.Register)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/task-list/task-list')
        .then(component => component.TaskList)
  },
  {
  path: 'categories',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/categories/category-list/category-list')
      .then(component => component.CategoryList)
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];