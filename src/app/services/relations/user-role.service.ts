import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from '../../models/user-role.model';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones CRUD de roles de usuario contra la API REST.
 * Proporciona métodos para obtener, crear, actualizar y eliminar asignaciones de roles a usuarios.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({ providedIn: 'root' })
export class UserRoleService {
  /**
   * URL base de la API para roles de usuario.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}user-role`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las asignaciones de roles a usuarios registradas en el sistema.
   * @returns Observable con un array de asignaciones de roles a usuarios
   */
  getUserRoles(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(this.apiUrl);
  }

  /**
   * Obtiene todas las asignaciones de roles para un usuario específico.
   * @param userId Identificador único del usuario
   * @returns Observable con un array de asignaciones de roles para el usuario
   */
  getUserRolesByUserId(userId: string): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Obtiene todas las asignaciones de usuarios para un rol específico.
   * @param roleId Identificador único del rol
   * @returns Observable con un array de asignaciones de usuarios para el rol
   */
  getUserRolesByRoleId(roleId: string): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/role/${roleId}`);
  }

  /**
   * Crea una nueva asignación de rol a usuario en el sistema.
   * @param userId ID del usuario
   * @param roleId ID del rol
   * @returns Observable con la asignación creada
   */
  createUserRole(userId: string, roleId: string): Observable<UserRole> {
    return this.http.post<UserRole>(`${this.apiUrl}/user/${userId}/role/${roleId}`, {});
  }

  /**
   * Elimina una asignación de rol a usuario del sistema.
   * @param userId Identificador único del usuario
   * @param roleId Identificador único del rol
   * @returns Observable vacío cuando la operación es exitosa
   */
  deleteUserRole(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/${userId}/role/${roleId}`);
  }
}
