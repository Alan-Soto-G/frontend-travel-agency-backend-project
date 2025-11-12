import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../../models/security-models/role.model';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones CRUD de roles contra la API REST.
 * Proporciona métodos para obtener, crear, actualizar y eliminar roles.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({ providedIn: 'root' }) // Esto hace que el servicio esté disponible en toda la aplicación
export class RoleService {
  /**
   * URL base de la API para roles.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}roles`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los roles registrados en el sistema.
   * @returns Observable con un array de roles
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /**
   * Obtiene un rol específico por su ID.
   * @param id Identificador único del rol
   * @returns Observable con el rol encontrado
   */
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo rol en el sistema.
   * @param role Objeto rol a crear
   * @returns Observable con el rol creado
   */
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  /**
   * Actualiza los datos de un rol existente.
   * @param id Identificador único del rol a actualizar
   * @param role Objeto rol con los datos actualizados
   * @returns Observable con el rol actualizado
   */
  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  /**
   * Elimina un rol del sistema por su ID.
   * @param id Identificador único del rol a eliminar
   * @returns Observable vacío cuando la operación es exitosa
   */
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
