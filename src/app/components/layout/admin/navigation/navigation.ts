export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'ti ti-dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'page',
    title: 'Pages',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Authentication',
        title: 'Authentication',
        type: 'collapse',
        icon: 'ti ti-key',
        children: [
          {
            id: 'login',
            title: 'Login',
            type: 'item',
            url: '/login',
            target: true,
            breadcrumbs: false
          },
          {
            id: 'register',
            title: 'Register',
            type: 'item',
            url: '/register',
            target: true,
            breadcrumbs: false
          }
        ]
      //inicio rutas cruds
      },
      {
        id: 'UserManagement',
        title: 'User Management',
        type: 'collapse',
        icon: 'ti ti-users',
        role: ['admin', 'manager'], // 🔥 Solo visible para estos roles
        children: [
          {
            id: 'users',
            title: 'Users',
            type: 'item',
            url: '/users',
            breadcrumbs: false
          },
          {
            id: 'roles',
            title: 'Roles',
            type: 'item',
            url: '/roles',
            breadcrumbs: false
          },
          {
            id: 'permissions',
            title: 'Permissions',
            type: 'item',
            url: '/permissions',
            breadcrumbs: false
          },
          {
            id: 'user-roles',
            title: 'User Roles',
            type: 'item',
            url: '/user-roles',
            breadcrumbs: false
          },
          {
            id: 'role-permissions',
            title: 'Role Permissions',
            type: 'item',
            url: '/role-permissions',
            breadcrumbs: false
          }
        ]
      //fin rutas cruds
      },
          {
      id: 'TravelAgency',
      title: 'Travel Agency',
      type: 'collapse',
      icon: 'ti ti-plane',
      children: [
        {
          id: 'trips',
          title: 'Trips',
          type: 'item',
          url: '/trips',
          breadcrumbs: false
        },
        {
          id: 'clients',
          title: 'Clients',
          type: 'item',
          url: '/clients',
          breadcrumbs: false
        },
        {
          id: 'invoices',
          title: 'Invoices',
          type: 'item',
          url: '/invoices',
          breadcrumbs: false
        },
        {
          id: 'fees',
          title: 'Fees',
          type: 'item',
          url: '/fees',
          breadcrumbs: false
        },
        {
          id: 'bank-cards',
          title: 'Bank Cards',
          type: 'item',
          url: '/bank-cards',
          breadcrumbs: false
        },
        {
          id: 'rooms',
          title: 'Rooms',
          type: 'item',
          url: '/rooms',
          breadcrumbs: false
        },
        {
          id: 'tourist-activities',
          title: 'Tourist Activities',
          type: 'item',
          url: '/tourist-activities',
          breadcrumbs: false
        },
        {
          id: 'transportation-services',
          title: 'Transportation Services',
          type: 'item',
          url: '/transportation-services',
          breadcrumbs: false
        },
        {
          id: 'plans',
          title: 'Plans',
          type: 'item',
          url: '/plans',
          breadcrumbs: false
        },
        {
          id: 'transport-itineraries',
          title: 'Transport Itineraries',
          type: 'item',
          url: '/transport-itineraries',
          breadcrumbs: false
        },
        {
          id: 'vehicles',
          title: 'Vehicles',
          type: 'item',
          url: '/vehicles',
          breadcrumbs: false
        }
      ]
    }

    ]
  },
  {
    id: 'elements',
    title: 'Elements',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'typography',
        title: 'Typography',
        type: 'item',
        classes: 'nav-item',
        url: '/typography',
        icon: 'ti ti-typography'
      },
      {
        id: 'color',
        title: 'Colors',
        type: 'item',
        classes: 'nav-item',
        url: '/color',
        icon: 'ti ti-brush'
      },
      {
        id: 'tabler',
        title: 'Tabler',
        type: 'item',
        classes: 'nav-item',
        url: 'https://tabler-icons.io/',
        icon: 'ti ti-plant-2',
        target: true,
        external: true
      }
    ]
  },
  {
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'ti ti-brand-chrome'
      },
      {
        id: 'document',
        title: 'Document',
        type: 'item',
        classes: 'nav-item',
        url: 'https://codedthemes.gitbook.io/berry-angular/',
        icon: 'ti ti-vocabulary',
        target: true,
        external: true
      }
    ]
  }
];
