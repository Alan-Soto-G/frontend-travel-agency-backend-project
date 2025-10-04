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
  allUsers: User[] = []; // Todos los usuarios para búsquedas y crear
  roles: Role[] = [];
  userRoles: Record<string, Role[]> = {}; // userId -> array de roles
  usersWithRoles: User[] = []; // Solo usuarios que tienen roles asignados
  isSearchMode: boolean = false; // Indica si estamos en modo búsqueda
  searchType: string = ''; // 'user' o 'role' para indicar el tipo de búsqueda
  isLoading: boolean = false; // Indica si se están cargando datos

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
        this.allUsers = [...users]; // Copia para usar en búsquedas y crear
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
    let loadedUsersCount = 0;

    this.users.forEach(user => {
      this.userRoleService.getUserRolesByUserId(user._id).subscribe({
        next: (userRoles: UserRole[]) => {
          if (userRoles && userRoles.length > 0) {
            this.userRoles[user._id] = userRoles.map(ur => ur.role);
            // Solo agregar usuarios que tienen roles asignados
            if (!this.usersWithRoles.find(u => u._id === user._id)) {
              this.usersWithRoles.push(user);
            }
          }

          loadedUsersCount++;
          // Cuando se han cargado todos los usuarios, ordenar la lista
          if (loadedUsersCount === this.users.length) {
            this.sortUsersWithRoles();
          }
        },
        error: (err) => {
          console.error(`Error al cargar roles para usuario ${user.name}`, err);
          loadedUsersCount++;
        }
      });
    });
  }

  /**
   * Ordena los usuarios con roles por nombre
   */
  private sortUsersWithRoles(): void {
    this.usersWithRoles.sort((a, b) => a.name.localeCompare(b.name));
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
            // Si es el primer rol del usuario, agregarlo a la lista de usuarios con roles
            if (!this.usersWithRoles.find(u => u._id === event.user._id)) {
              this.usersWithRoles.push(event.user);
              this.sortUsersWithRoles();
            }
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

            // Si el usuario ya no tiene roles, removerlo de la lista de usuarios con roles
            if (this.userRoles[event.user._id].length === 0) {
              this.usersWithRoles = this.usersWithRoles.filter(u => u._id !== event.user._id);
              delete this.userRoles[event.user._id];
            }
          }
          console.log(`Rol ${event.role.name} removido de ${event.user.name}`);
        },
        error: (err) => console.error('Error al eliminar asignación de rol', err)
      });
    }
  }

  /**
   * Maneja la creación de asignaciones desde el modal de crear
   * @param event Evento con userId y roleId
   */
  onCreateAssignment(event: {userId: string, roleId: string}): void {
    const user = this.allUsers.find(u => u._id === event.userId);
    const role = this.roles.find(r => r._id === event.roleId);

    if (user && role) {
      // Verificar si ya existe la asignación
      const hasRole = this.userRoles[event.userId]?.some(r => r._id === event.roleId);

      if (hasRole) {
        // Eliminar asignación
        this.onRoleToggle({user, role, checked: false});
      } else {
        // Crear asignación
        this.onRoleToggle({user, role, checked: true});
      }
    }
  }

  /**
   * Busca asignaciones por usuario
   * @param userId ID del usuario a buscar
   */
  onSearchByUser(userId: string): void {
    this.userRoleService.getUserRolesByUserId(userId).subscribe({
      next: (userRoles: UserRole[]) => {
        this.isSearchMode = true;
        this.searchType = 'user';
        this.usersWithRoles = [];
        this.userRoles = {};

        // Encontrar el usuario siempre (tenga o no roles)
        const user = this.allUsers.find(u => u._id === userId);
        if (user) {
          this.usersWithRoles = [user];

          if (userRoles && userRoles.length > 0) {
            // Usuario tiene roles asignados
            this.userRoles[userId] = userRoles.map(ur => ur.role);
          } else {
            // Usuario no tiene roles asignados - inicializar con array vacío
            this.userRoles[userId] = [];
          }
        }

        console.log(`Búsqueda por usuario completada: ${userRoles.length} asignaciones encontradas`);
      },
      error: (err) => console.error('Error al buscar por usuario', err)
    });
  }

  /**
   * Busca asignaciones por rol
   * @param roleId ID del rol a buscar
   */
  onSearchByRole(roleId: string): void {
    this.isLoading = true; // Iniciar carga
    this.isSearchMode = true;
    this.searchType = 'role';
    this.usersWithRoles = [];
    this.userRoles = {};

    this.userRoleService.getUserRolesByRoleId(roleId).subscribe({
      next: (userRoles: UserRole[]) => {
        if (userRoles && userRoles.length > 0) {
          // Obtener todos los usuarios que tienen el rol buscado
          const usersWithSearchedRole = new Set<string>();

          userRoles.forEach(ur => {
            usersWithSearchedRole.add(ur.user._id);
          });

          // Para cada usuario que tiene el rol buscado, cargar TODOS sus roles
          let processedUsers = 0;
          const totalUsers = usersWithSearchedRole.size;

          usersWithSearchedRole.forEach(userId => {
            this.userRoleService.getUserRolesByUserId(userId).subscribe({
              next: (allUserRoles: UserRole[]) => {
                const user = this.allUsers.find(u => u._id === userId);
                if (user) {
                  this.usersWithRoles.push(user);
                  // Guardar TODOS los roles del usuario, no solo el buscado
                  this.userRoles[userId] = allUserRoles.map(ur => ur.role);
                }

                processedUsers++;
                // Cuando se han procesado todos los usuarios, ordenar la lista y finalizar carga
                if (processedUsers === totalUsers) {
                  this.sortUsersWithRoles();
                  this.isLoading = false; // Finalizar carga aquí
                }
              },
              error: (err) => {
                console.error(`Error al cargar todos los roles para usuario ${userId}`, err);
                processedUsers++;
                if (processedUsers === totalUsers) {
                  this.sortUsersWithRoles();
                  this.isLoading = false; // Finalizar carga aquí también en caso de error
                }
              }
            });
          });
        } else {
          // No hay usuarios con este rol, finalizar carga inmediatamente
          this.isLoading = false;
        }

        console.log(`Búsqueda por rol completada: ${userRoles.length} asignaciones encontradas`);
      },
      error: (err) => {
        console.error('Error al buscar por rol', err);
        this.isLoading = false; // Finalizar carga en caso de error
      }
    });
  }

  /**
   * Lista todas las asignaciones (botón "Listar Todo")
   */
  onListAll(): void {
    // Limpiar completamente el estado antes de recargar
    this.isSearchMode = false;
    this.searchType = '';
    this.usersWithRoles = [];
    this.userRoles = {};

    // Recargar todos los datos desde cero
    this.loadData();
    console.log('Cargando todas las asignaciones...');
  }

  /**
   * Resetea la vista a mostrar todos los usuarios con roles
   */
  resetToAllUsers(): void {
    this.isSearchMode = false;
    this.loadData();
  }
}
