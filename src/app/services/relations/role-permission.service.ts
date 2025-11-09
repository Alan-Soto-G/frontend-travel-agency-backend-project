import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolePermission } from '../../models/security-models/role-permission.model';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones CRUD de permisos de roles contra la API REST.
 * Proporciona métodos para obtener, crear, actualizar y eliminar asignaciones de permisos a roles.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  /**
   * URL base de la API para permisos de roles.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}role-permission`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las asignaciones de permisos a roles registradas en el sistema.
   * @returns Observable con un array de asignaciones de permisos a roles
   */
  getRolePermissions(): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(this.apiUrl);
  }

  /**
   * Obtiene todas las asignaciones de permisos para un rol específico.
   * @param roleId Identificador único del rol
   * @returns Observable con un array de asignaciones de permisos para el rol
   */
  getRolePermissionsByRoleId(roleId: string): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${this.apiUrl}/role/${roleId}`);
  }

  /**
   * Obtiene todas las asignaciones de roles para un permiso específico.
   * @param permissionId Identificador único del permiso
   * @returns Observable con un array de asignaciones de roles para el permiso
   */
  getRolePermissionsByPermissionId(permissionId: string): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${this.apiUrl}/permission/${permissionId}`);
  }

  /**
   * Crea una nueva asignación de permiso a rol en el sistema.
   * @param roleId ID del rol
   * @param permissionId ID del permiso
   * @returns Observable con la asignación creada
   */
  createRolePermission(roleId: string, permissionId: string): Observable<RolePermission> {
    return this.http.post<RolePermission>(`${this.apiUrl}/role/${roleId}/permission/${permissionId}`, {});
  }

  /**
   * Elimina una asignación de permiso a rol del sistema.
   * @param roleId Identificador único del rol
   * @param permissionId Identificador único del permiso
   * @returns Observable vacío cuando la operación es exitosa
   */
  deleteRolePermission(roleId: string, permissionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/role/${roleId}/permission/${permissionId}`);
  }
}
