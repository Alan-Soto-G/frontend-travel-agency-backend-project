import { Component, OnInit } from '@angular/core';
import { AsignacionCrudComponent } from '../../components/asignacion-crud/asignacion-crud.component';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { UserRole } from '../../models/user-role.model';
import { GenericEntity, AssignmentConfig } from '../../models/assignment-config.model';
import { UserRoleService } from "../../services/relations/user-role.service";
import { UserService } from '../../services/models/user.service';
import { RoleService } from '../../services/models/role.service';

@Component({
  selector: 'app-user-roles',
  imports: [AsignacionCrudComponent],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.scss'
})
export class UserRolesComponent implements OnInit {
  // Datos originales
  users: User[] = [];
  allUsers: User[] = [];
  roles: Role[] = [];
  userRoles: Record<string, Role[]> = {};
  usersWithRoles: User[] = [];
  isSearchMode: boolean = false;
  searchType: string = '';
  isLoading: boolean = false;

  // Datos genéricos para el componente reutilizable
  genericEntities: GenericEntity[] = [];
  genericAssignments: GenericEntity[] = [];
  genericEntityAssignments: Record<string, GenericEntity[]> = {};
  genericAllEntities: GenericEntity[] = [];

  constructor(
    private userRoleService: UserRoleService,
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Convierte User[] a GenericEntity[]
   */
  private convertUsersToGenericEntities(users: User[]): GenericEntity[] {
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      ...user
    }));
  }

  /**
   * Convierte Role[] a GenericEntity[]
   */
  private convertRolesToGenericEntities(roles: Role[]): GenericEntity[] {
    return roles.map(role => ({
      _id: role._id,
      name: role.name,
      description: role.description,
      ...role
    }));
  }

  /**
   * Convierte userRoles a formato genérico
   */
  private convertUserRolesToGeneric(): void {
    this.genericEntityAssignments = {};
    Object.keys(this.userRoles).forEach(userId => {
      this.genericEntityAssignments[userId] = this.convertRolesToGenericEntities(this.userRoles[userId]);
    });
  }

  /**
   * Actualiza los datos genéricos basándose en los datos originales
   */
  private updateGenericData(): void {
    this.genericEntities = this.convertUsersToGenericEntities(this.usersWithRoles);
    this.genericAllEntities = this.convertUsersToGenericEntities(this.allUsers);
    this.genericAssignments = this.convertRolesToGenericEntities(this.roles);
    this.convertUserRolesToGeneric();
  }

  /**
   * Maneja el evento de cambio de asignación del componente genérico
   */
  onAssignmentToggle(event: {entity: GenericEntity, assignment: GenericEntity, checked: boolean}): void {
    // Convertir de vuelta a los tipos específicos
    const user = this.allUsers.find(u => u._id === event.entity._id);
    const role = this.roles.find(r => r._id === event.assignment._id);

    if (user && role) {
      this.onRoleToggle({user, role, checked: event.checked});
    }
  }

  /**
   * Maneja la búsqueda por entidad del componente genérico
   */
  onSearchByEntity(entityId: string): void {
    this.onSearchByUser(entityId);
  }

  /**
   * Maneja la búsqueda por asignación del componente genérico
   */
  onSearchByAssignment(assignmentId: string): void {
    this.onSearchByRole(assignmentId);
  }

  /**
   * Inicializa la carga de datos al iniciar el componente.
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
      next: (roles) => {
        this.roles = roles;
        this.updateGenericData();
      },
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
            this.updateGenericData();
          }
        },
        error: (err) => {
          console.error(`Error al cargar roles para usuario ${user.name}`, err);
          loadedUsersCount++;
          if (loadedUsersCount === this.users.length) {
            this.updateGenericData();
          }
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
          this.updateGenericData();
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
          this.updateGenericData();
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
        this.searchType = 'entity';
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

        this.updateGenericData();
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
    this.searchType = 'assignment';
    this.usersWithRoles = [];
    this.userRoles = {};

    this.userRoleService.getUserRolesByRoleId(roleId).subscribe({
      next: (userRoles: UserRole[]) => {
        if (userRoles && userRoles.length > 0) {
          // Obtener todos los usuarios que tienen el rol buscado
          // Filtrar solo los que tienen user válido
          const usersWithSearchedRole = new Set<string>();

          userRoles.forEach(ur => {
            // Validar que ur.user existe y tiene _id
            if (ur.user && ur.user._id) {
              usersWithSearchedRole.add(ur.user._id);
            }
          });

          // Si no hay usuarios válidos, terminar aquí
          if (usersWithSearchedRole.size === 0) {
            this.updateGenericData();
            this.isLoading = false;
            console.log('No se encontraron usuarios válidos con este rol');
            return;
          }

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
                  // Filtrar roles válidos
                  this.userRoles[userId] = allUserRoles
                    .filter(ur => ur.role && ur.role._id)
                    .map(ur => ur.role);
                }

                processedUsers++;
                // Cuando se han procesado todos los usuarios, ordenar la lista y finalizar carga
                if (processedUsers === totalUsers) {
                  this.sortUsersWithRoles();
                  this.updateGenericData();
                  this.isLoading = false; // Finalizar carga aquí
                }
              },
              error: (err) => {
                console.error(`Error al cargar todos los roles para usuario ${userId}`, err);
                processedUsers++;
                if (processedUsers === totalUsers) {
                  this.sortUsersWithRoles();
                  this.updateGenericData();
                  this.isLoading = false; // Finalizar carga aquí también en caso de error
                }
              }
            });
          });
        } else {
          // No hay usuarios con este rol, finalizar carga inmediatamente
          this.updateGenericData();
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
}
