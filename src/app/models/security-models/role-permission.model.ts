import { Role } from './role.model';
import { Permission } from './permission.model';

export interface RolePermission {
  _id: string;
  role: Role;
  permission: Permission;
}

