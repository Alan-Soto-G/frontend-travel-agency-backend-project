import { User } from './user.model';
import { Role } from './role.model';

export interface UserRole {
  user: User;
  role: Role;
}
