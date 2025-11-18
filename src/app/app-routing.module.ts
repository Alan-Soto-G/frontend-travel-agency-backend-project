import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './components/layout/admin/admin.component';
import { GuestComponent } from './components/layout/guest/guest.component';
import { HttpClientModule } from '@angular/common/http';
import { PermissionsComponent } from './pages/security/permissions/permissions.component';
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
        loadComponent: () => import('./pages/security/users/users.component').then((m) => m.UsersComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/users',
          method: 'GET'
        }
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/security/roles/roles.component').then((m) => m.RolesComponent),
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
        loadComponent: () => import('./pages/security/user-roles/user-roles.component').then((m) => m.UserRolesComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/user-role',
          method: 'GET'
        }
      },
      {
        path: 'role-permissions',
        loadComponent: () => import('./pages/security/role-permissions/role-permissions.component').then((m) => m.RolePermissionsComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/role-permission',
          method: 'GET'
        }
      },
      //business
      {
        path: 'trips',
        loadComponent: () => import('./pages/business/trips/trips.component').then((m) => m.TripsComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/trips',
          method: 'GET'
        }
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/business/clients/clients.component').then((m) => m.ClientsComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/clients',
          method: 'GET'
        }
      },
      {
        path: 'invoices',
        loadComponent: () => import('./pages/business/invoices/invoices.component').then((m) => m.InvoicesComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/invoices',
          method: 'GET'
        }
      },
      {
        path: 'fees',
        loadComponent: () => import('./pages/business/fees/fees.component').then((m) => m.FeesComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/fees',
          method: 'GET'
        }
      },
      {
        path: 'bank-cards',
        loadComponent: () => import('./pages/business/bank-cards/bank-cards.component').then((m) => m.BankCardsComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/bank-cards',
          method: 'GET'
        }
      },
      {
        path: 'rooms',
        loadComponent: () => import('./pages/business/rooms/rooms.component').then((m) => m.RoomsComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/rooms',
          method: 'GET'
        }
      },
      {
        path: 'tourist-activities',
        loadComponent: () => import('./pages/business/tourist-activities/tourist-activities.component').then((m) => m.TouristActivitiesComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/tourist-activities',
          method: 'GET'
        }
      },

      {
        path: 'plans',
        loadComponent: () => import('./pages/business/plans/plans.component').then((m) => m.PlansComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/plans',
          method: 'GET'
        }
      },
      {
        path: 'journeys',
        loadComponent: () => import('./pages/business/journeys/journeys.component').then((m) => m.JourneysComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/journeys',
          method: 'GET'
        }
      },
      {
        path: 'transport-itineraries',
        loadComponent: () => import('./pages/business/transport-itineraries/transport-itineraries.component').then((m) => m.TransportItinerariesComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/transport-itineraries',
          method: 'GET'
        }
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./pages/business/vehicles/vehicles.component').then((m) => m.VehiclesComponent),
        canActivate: [permissionGuard],
        data: {
          apiUrl: '/api/vehicles',
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
