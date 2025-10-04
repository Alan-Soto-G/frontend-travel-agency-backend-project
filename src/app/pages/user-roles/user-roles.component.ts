import { Component, OnInit } from '@angular/core';
import { AsignacionCrudComponent } from '../../components/asignacion-crud/asignacion-crud.component';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { UserRole } from '../../models/user-role.model';
import { UserRoleService } from "../../services/user-role.service";
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-user-roles',
  imports: [AsignacionCrudComponent],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.scss'
})
export class UserRolesComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  userRoles: Record<string, Role[]> = {}; // userId -> array de roles

  constructor(
    private userRoleService: UserRoleService,
    private userService: UserService,
    private roleService: RoleService
  ) {}

  /**
   * Inicializa la carga de datos al iniciar el componente.
   */
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Carga todos los datos necesarios: usuarios, roles y asignaciones.
   */
  loadData(): void {
    // Cargar usuarios
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadUserRolesForAllUsers();
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });

    // Cargar todos los roles disponibles
    this.roleService.getRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  /**
   * Carga los roles asignados para todos los usuarios.
   */
  private loadUserRolesForAllUsers(): void {
    this.users.forEach(user => {
      this.userRoleService.getUserRolesByUserId(user._id).subscribe({
        next: (userRoles: UserRole[]) => {
          this.userRoles[user._id] = userRoles.map(ur => ur.role);
        },
        error: (err) => console.error(`Error al cargar roles para usuario ${user.name}`, err)
      });
    });
  }

  /**
   * Maneja el evento de cambio de rol (marcar/desmarcar checkbox).
   * @param event Evento emitido desde el componente asignacion-crud
   */
  onRoleToggle(event: {user: User, role: Role, checked: boolean}): void {
    if (event.checked) {
      // Crear nueva asignación
      this.userRoleService.createUserRole(event.user._id, event.role._id).subscribe({
        next: () => {
          // Actualizar la lista local
          if (!this.userRoles[event.user._id]) {
            this.userRoles[event.user._id] = [];
          }
          this.userRoles[event.user._id].push(event.role);
          console.log(`Rol ${event.role.name} asignado a ${event.user.name}`);
        },
        error: (err) => console.error('Error al crear asignación de rol', err)
      });
    } else {
      // Eliminar asignación existente
      this.userRoleService.deleteUserRole(event.user._id, event.role._id).subscribe({
        next: () => {
          // Actualizar la lista local
          if (this.userRoles[event.user._id]) {
            this.userRoles[event.user._id] = this.userRoles[event.user._id].filter(
              role => role._id !== event.role._id
            );
          }
          console.log(`Rol ${event.role.name} removido de ${event.user.name}`);
        },
        error: (err) => console.error('Error al eliminar asignación de rol', err)
      });
    }
  }
}
