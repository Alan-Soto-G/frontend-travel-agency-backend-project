import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission } from '../../models/permission.model';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones CRUD de usuarios contra la API REST.
 * Proporciona métodos para obtener, crear, actualizar y eliminar usuarios.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({ providedIn: 'root' }) // Esto hace que el servicio esté disponible en toda la aplicación
export class PermissionService {
  /**
   * URL base de la API para usuarios.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}permissions`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios registrados en el sistema.
   * @returns Observable con un array de usuarios
   */
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  /**
   * Obtiene un usuario específico por su ID.
   * @param id Identificador único del usuario
   * @returns Observable con el usuario encontrado
   */
  getPermissionById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param Permission Objeto usuario a crear
   * @returns Observable con el usuario creado
   */
  createPermission(Permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, Permission);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param id Identificador único del usuario a actualizar
   * @param Permission Objeto usuario con los datos actualizados
   * @returns Observable con el usuario actualizado
   */
  updatePermission(id: string, Permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, Permission);
  }

  /**
   * Elimina un usuario del sistema por su ID.
   * @param id Identificador único del usuario a eliminar
   * @returns Observable vacío cuando la operación es exitosa
   */
  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
