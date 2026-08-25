import { UserRole } from '../types/index.js';

export interface NavItem {
  label: string;
  path: string;
  iconName: string;
  roles: UserRole[];
  badge?: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    iconName: 'LayoutDashboard',
    roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'EMPLOYEE', 'WAREHOUSE_STAFF', 'FINANCE', 'VENDOR']
  },
  {
    label: 'Organizations',
    path: '/super-admin/organizations',
    iconName: 'Building2',
    roles: ['SUPER_ADMIN']
  },
  {
    label: 'Organization Setup',
    path: '/organization',
    iconName: 'Building',
    roles: ['ORGANIZATION_ADMIN']
  },
  {
    label: 'Users & Roles',
    path: '/users',
    iconName: 'Users',
    roles: ['ORGANIZATION_ADMIN', 'SUPER_ADMIN']
  },
  {
    label: 'Vendors',
    path: '/vendors',
    iconName: 'Store',
    roles: ['ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE', 'VENDOR']
  },
  {
    label: 'Products',
    path: '/products',
    iconName: 'Package',
    roles: ['ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'EMPLOYEE', 'WAREHOUSE_STAFF', 'FINANCE']
  },
  {
    label: 'Vendor Offers',
    path: '/vendor-offers',
    iconName: 'Tag',
    roles: ['ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'VENDOR']
  },
  {
    label: 'Purchase Requests',
    path: '/purchase-requests',
    iconName: 'FileText',
    roles: ['ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'EMPLOYEE', 'FINANCE']
  },
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    iconName: 'ShoppingBag',
    roles: ['ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'WAREHOUSE_STAFF', 'FINANCE', 'VENDOR']
  },
  {
    label: 'Goods Receipts (GRN)',
    path: '/goods-receipts',
    iconName: 'Truck',
    roles: ['ORGANIZATION_ADMIN', 'WAREHOUSE_STAFF', 'PROCUREMENT_MANAGER']
  },
  {
    label: 'Inventory',
    path: '/inventory',
    iconName: 'Boxes',
    roles: ['ORGANIZATION_ADMIN', 'WAREHOUSE_STAFF', 'PROCUREMENT_MANAGER', 'EMPLOYEE']
  },
  {
    label: 'Reports & Spend',
    path: '/reports',
    iconName: 'BarChart3',
    roles: ['ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE', 'SUPER_ADMIN']
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    iconName: 'ShieldCheck',
    roles: ['ORGANIZATION_ADMIN', 'SUPER_ADMIN']
  }
];

export const canAccessRoute = (role?: UserRole, requiredRoles?: UserRole[]): boolean => {
  if (!role) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(role);
};
