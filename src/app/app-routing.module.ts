import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './components/layout/admin/admin.component';
import { GuestComponent } from './components/layout/guest/guest.component';
import { HttpClientModule } from '@angular/common/http';
import { PermissionsComponent } from './pages/permissions/permissions.component';
import { authGuard } from './guard/auth.guard';
import { permissionGuard } from './guard/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard], // Protege toda la sección admin
    children: [
      {
        path: '',
        redirectTo: '/default',
        pathMatch: 'full'
      },
      {
        path: 'default',
        loadComponent: () => import('./pages/dashboard/default/default.component').then((c) => c.DefaultComponent),
        canActivate: [permissionGuard],
        data: { 
          apiUrl: '/api/dashboard', // Ajusta según tu endpoint
          method: 'GET'
        }
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/elements/typography/typography.component').then((c) => c.TypographyComponent)
        // Sin guard de permisos - acceso libre para usuarios autenticados
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component').then((c) => c.ElementColorComponent)
        // Sin guard de permisos - acceso libre para usuarios autenticados
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/other/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
        // Sin guard de permisos - acceso libre para usuarios autenticados
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent),
        canActivate: [permissionGuard],
        data: { 
          apiUrl: '/api/users',
          method: 'GET'
        }
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles.component').then((m) => m.RolesComponent),
        canActivate: [permissionGuard],
        data: { 
          apiUrl: '/api/roles',
          method: 'GET'
        }
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [permissionGuard],
        data: { 
          apiUrl: '/api/permissions',
          method: 'GET'
        }
      },
      {
        path: 'user-roles',
        loadComponent: () => import('./pages/user-roles/user-roles.component').then((m) => m.UserRolesComponent),
        canActivate: [permissionGuard],
        data: { 
          apiUrl: '/api/user-role',
          method: 'GET'
        }
      },
      {
        path: 'main',
        loadComponent: () => import('./pages/main/main.component').then((c) => c.MainComponent)
        // Sin guard de permisos - acceso libre para usuarios autenticados
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/authentication/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/authentication/register/register.component').then((c) => c.RegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}