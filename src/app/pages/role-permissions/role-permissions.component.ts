import { Component, OnInit } from '@angular/core';
import { AsignacionCrudComponent } from '../../components/asignacion-crud/asignacion-crud.component';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { RolePermission } from '../../models/role-permission.model';
import { GenericEntity } from '../../models/assignment-config.model';
import { RolePermissionService } from "../../services/relations/role-permission.service";
import { RoleService } from '../../services/models/role.service';
import { PermissionService } from '../../services/models/permission.service';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [AsignacionCrudComponent],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.scss'
})
export class RolePermissionsComponent implements OnInit {
  // Datos originales
  roles: Role[] = [];
  allRoles: Role[] = [];
  permissions: Permission[] = [];
  rolePermissions: Record<string, Permission[]> = {};
  rolesWithPermissions: Role[] = [];
  isSearchMode: boolean = false;
  searchType: string = '';
  isLoading: boolean = false;

  // Datos genéricos para el componente reutilizable
  genericEntities: GenericEntity[] = [];
  genericAssignments: GenericEntity[] = [];
  genericEntityAssignments: Record<string, GenericEntity[]> = {};
  genericAllEntities: GenericEntity[] = [];

  constructor(
    private rolePermissionService: RolePermissionService,
    private roleService: RoleService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadData();
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
   * Convierte Permission[] a GenericEntity[]
   */
  private convertPermissionsToGenericEntities(permissions: Permission[]): GenericEntity[] {
    return permissions.map(permission => ({
      _id: permission._id,
      name: `${permission.method} ${permission.url} - ${permission.model}`,
      description: `Método: ${permission.method} | URL: ${permission.url} | Model: ${permission.model}`,
      ...permission
    }));
  }

  /**
   * Convierte rolePermissions a formato genérico
   */
  private convertRolePermissionsToGeneric(): void {
    this.genericEntityAssignments = {};
    Object.keys(this.rolePermissions).forEach(roleId => {
      this.genericEntityAssignments[roleId] = this.convertPermissionsToGenericEntities(this.rolePermissions[roleId]);
    });
  }

  /**
   * Actualiza los datos genéricos basándose en los datos originales
   */
  private updateGenericData(): void {
    this.genericEntities = this.convertRolesToGenericEntities(this.rolesWithPermissions);
    this.genericAllEntities = this.convertRolesToGenericEntities(this.allRoles);
    this.genericAssignments = this.convertPermissionsToGenericEntities(this.permissions);
    this.convertRolePermissionsToGeneric();
  }

  /**
   * Maneja el evento de cambio de asignación del componente genérico
   */
  onAssignmentToggle(event: {entity: GenericEntity, assignment: GenericEntity, checked: boolean}): void {
    // Convertir de vuelta a los tipos específicos
    const role = this.allRoles.find(r => r._id === event.entity._id);
    const permission = this.permissions.find(p => p._id === event.assignment._id);

    if (role && permission) {
      this.onPermissionToggle({role, permission, checked: event.checked});
    }
  }

  /**
   * Maneja la búsqueda por entidad del componente genérico
   */
  onSearchByEntity(entityId: string): void {
    this.onSearchByRole(entityId);
  }

  /**
   * Maneja la búsqueda por asignación del componente genérico
   */
  onSearchByAssignment(assignmentId: string): void {
    this.onSearchByPermission(assignmentId);
  }

  /**
   * Inicializa la carga de datos al iniciar el componente.
   */
  loadData(): void {
    // Cargar roles
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.allRoles = [...roles]; // Copia para usar en búsquedas y crear
        this.loadRolePermissionsForAllRoles();
      },
      error: (err) => console.error('Error al cargar roles', err)
    });

    // Cargar todos los permisos disponibles
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.updateGenericData();
      },
      error: (err) => console.error('Error al cargar permisos', err)
    });
  }

  /**
   * Carga los permisos asignados para todos los roles.
   */
  private loadRolePermissionsForAllRoles(): void {
    let loadedRolesCount = 0;

    this.roles.forEach(role => {
      this.rolePermissionService.getRolePermissionsByRoleId(role._id).subscribe({
        next: (rolePermissions: RolePermission[]) => {
          if (rolePermissions && rolePermissions.length > 0) {
            // Filtrar permisos válidos antes de mapear
            const validPermissions = rolePermissions
              .filter(rp => rp.permission && rp.permission._id)
              .map(rp => rp.permission);

            if (validPermissions.length > 0) {
              this.rolePermissions[role._id] = validPermissions;
              // Solo agregar roles que tienen permisos válidos asignados
              if (!this.rolesWithPermissions.find(r => r._id === role._id)) {
                this.rolesWithPermissions.push(role);
              }
            }
          }

          loadedRolesCount++;
          // Cuando se han cargado todos los roles, ordenar la lista
          if (loadedRolesCount === this.roles.length) {
            this.sortRolesWithPermissions();
            this.updateGenericData();
          }
        },
        error: (err) => {
          console.error(`Error al cargar permisos para rol ${role.name}`, err);
          loadedRolesCount++;
          if (loadedRolesCount === this.roles.length) {
            this.updateGenericData();
          }
        }
      });
    });
  }

  /**
   * Ordena los roles con permisos por nombre
   */
  private sortRolesWithPermissions(): void {
    this.rolesWithPermissions.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Maneja el evento de cambio de permiso (marcar/desmarcar checkbox).
   * @param event Evento emitido desde el componente asignacion-crud
   */
  onPermissionToggle(event: {role: Role, permission: Permission, checked: boolean}): void {
    if (event.checked) {
      // Crear nueva asignación
      this.rolePermissionService.createRolePermission(event.role._id, event.permission._id).subscribe({
        next: () => {
          // Actualizar la lista local
          if (!this.rolePermissions[event.role._id]) {
            this.rolePermissions[event.role._id] = [];
            // Si es el primer permiso del rol, agregarlo a la lista de roles con permisos
            if (!this.rolesWithPermissions.find(r => r._id === event.role._id)) {
              this.rolesWithPermissions.push(event.role);
              this.sortRolesWithPermissions();
            }
          }
          this.rolePermissions[event.role._id].push(event.permission);
          this.updateGenericData();
          console.log(`Permiso ${event.permission.url} asignado a ${event.role.name}`);
        },
        error: (err) => console.error('Error al crear asignación de permiso', err)
      });
    } else {
      // Eliminar asignación existente
      this.rolePermissionService.deleteRolePermission(event.role._id, event.permission._id).subscribe({
        next: () => {
          // Actualizar la lista local
          if (this.rolePermissions[event.role._id]) {
            this.rolePermissions[event.role._id] = this.rolePermissions[event.role._id].filter(
              permission => permission._id !== event.permission._id
            );

            // Si el rol ya no tiene permisos, removerlo de la lista de roles con permisos
            if (this.rolePermissions[event.role._id].length === 0) {
              this.rolesWithPermissions = this.rolesWithPermissions.filter(r => r._id !== event.role._id);
              delete this.rolePermissions[event.role._id];
            }
          }
          this.updateGenericData();
          console.log(`Permiso ${event.permission.url} removido de ${event.role.name}`);
        },
        error: (err) => console.error('Error al eliminar asignación de permiso', err)
      });
    }
  }

  /**
   * Maneja la creación de asignaciones desde el modal de crear
   * @param event Evento con roleId y permissionId
   */
  onCreateAssignment(event: {roleId: string, permissionId: string}): void {
    const role = this.allRoles.find(r => r._id === event.roleId);
    const permission = this.permissions.find(p => p._id === event.permissionId);

    if (role && permission) {
      // Verificar si ya existe la asignación
      const hasPermission = this.rolePermissions[event.roleId]?.some(p => p._id === event.permissionId);

      if (hasPermission) {
        // Eliminar asignación
        this.onPermissionToggle({role, permission, checked: false});
      } else {
        // Crear asignación
        this.onPermissionToggle({role, permission, checked: true});
      }
    }
  }

  /**
   * Busca asignaciones por rol
   * @param roleId ID del rol a buscar
   */
  onSearchByRole(roleId: string): void {
    this.rolePermissionService.getRolePermissionsByRoleId(roleId).subscribe({
      next: (rolePermissions: RolePermission[]) => {
        this.isSearchMode = true;
        this.searchType = 'entity';
        this.rolesWithPermissions = [];
        this.rolePermissions = {};

        // Encontrar el rol siempre (tenga o no permisos)
        const role = this.allRoles.find(r => r._id === roleId);
        if (role) {
          this.rolesWithPermissions = [role];

          if (rolePermissions && rolePermissions.length > 0) {
            // Filtrar permisos válidos antes de mapear
            const validPermissions = rolePermissions
              .filter(rp => rp.permission && rp.permission._id)
              .map(rp => rp.permission);

            this.rolePermissions[roleId] = validPermissions;
          } else {
            // Rol no tiene permisos asignados - inicializar con array vacío
            this.rolePermissions[roleId] = [];
          }
        }

        this.updateGenericData();
        console.log(`Búsqueda por rol completada: ${rolePermissions.length} asignaciones encontradas`);
      },
      error: (err) => console.error('Error al buscar por rol', err)
    });
  }

  /**
   * Busca asignaciones por permiso
   * @param permissionId ID del permiso a buscar
   */
  onSearchByPermission(permissionId: string): void {
    this.isLoading = true; // Iniciar carga
    this.isSearchMode = true;
    this.searchType = 'assignment';
    this.rolesWithPermissions = [];
    this.rolePermissions = {};

    this.rolePermissionService.getRolePermissionsByPermissionId(permissionId).subscribe({
      next: (rolePermissions: RolePermission[]) => {
        if (rolePermissions && rolePermissions.length > 0) {
          // Obtener todos los roles que tienen el permiso buscado
          // Filtrar solo los que tienen role válido
          const rolesWithSearchedPermission = new Set<string>();

          rolePermissions.forEach(rp => {
            // Validar que rp.role existe y tiene _id
            if (rp.role && rp.role._id) {
              rolesWithSearchedPermission.add(rp.role._id);
            }
          });

          // Si no hay roles válidos, terminar aquí
          if (rolesWithSearchedPermission.size === 0) {
            this.updateGenericData();
            this.isLoading = false;
            console.log('No se encontraron roles válidos con este permiso');
            return;
          }

          // Para cada rol que tiene el permiso buscado, cargar TODOS sus permisos
          let processedRoles = 0;
          const totalRoles = rolesWithSearchedPermission.size;

          rolesWithSearchedPermission.forEach(roleId => {
            this.rolePermissionService.getRolePermissionsByRoleId(roleId).subscribe({
              next: (allRolePermissions: RolePermission[]) => {
                const role = this.allRoles.find(r => r._id === roleId);
                if (role) {
                  this.rolesWithPermissions.push(role);
                  // Guardar TODOS los permisos del rol, no solo el buscado
                  // Filtrar permisos válidos
                  this.rolePermissions[roleId] = allRolePermissions
                    .filter(rp => rp.permission && rp.permission._id)
                    .map(rp => rp.permission);
                }

                processedRoles++;
                // Cuando se han procesado todos los roles, ordenar la lista y finalizar carga
                if (processedRoles === totalRoles) {
                  this.sortRolesWithPermissions();
                  this.updateGenericData();
                  this.isLoading = false; // Finalizar carga aquí
                }
              },
              error: (err) => {
                console.error(`Error al cargar todos los permisos para rol ${roleId}`, err);
                processedRoles++;
                if (processedRoles === totalRoles) {
                  this.sortRolesWithPermissions();
                  this.updateGenericData();
                  this.isLoading = false; // Finalizar carga aquí también en caso de error
                }
              }
            });
          });
        } else {
          // No hay roles con este permiso, finalizar carga inmediatamente
          this.updateGenericData();
          this.isLoading = false;
        }

        console.log(`Búsqueda por permiso completada: ${rolePermissions.length} asignaciones encontradas`);
      },
      error: (err) => {
        console.error('Error al buscar por permiso', err);
        this.isLoading = false; // Finalizar carga en caso de error
      }
    });
  }

  /**
   * Maneja el evento de listar todo
   */
  onListAll(): void {
    this.isSearchMode = false;
    this.searchType = '';
    this.loadData();
  }
}
