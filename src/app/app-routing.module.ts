import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './components/layout/admin/admin.component';
import { GuestComponent } from './components/layout/guest/guest.component';
import { HttpClientModule } from '@angular/common/http';
import { PermissionsComponent } from './pages/permissions/permissions.component'

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/default',
        pathMatch: 'full'
      },
      {
        path: 'default',
        loadComponent: () => import('./pages/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/elements/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component').then((c) => c.ElementColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/other/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles.component').then((m) => m.RolesComponent)
      },
      {
        path: 'permissions',
        component: PermissionsComponent
      },
      {
        path: 'user-roles',
        loadComponent: () => import('./pages/user-roles/user-roles.component').then((m) => m.UserRolesComponent)
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
