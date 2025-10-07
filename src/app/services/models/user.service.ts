import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones CRUD de usuarios contra la API REST.
 * Proporciona métodos para obtener, crear, actualizar y eliminar usuarios.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({ providedIn: 'root' }) // Esto hace que el servicio esté disponible en toda la aplicación
export class UserService {
  /**
   * URL base de la API para usuarios.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}users`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios registrados en el sistema.
   * @returns Observable con un array de usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Obtiene un usuario específico por su ID.
   * @param id Identificador único del usuario
   * @returns Observable con el usuario encontrado
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   *
   * Obtiene un usuario específico por su email.
   * @param email Email del usuario
   * @returns Observable con el usuario encontrado
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param user Objeto usuario a crear
   * @returns Observable con el usuario creado
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param id Identificador único del usuario a actualizar
   * @param user Objeto usuario con los datos actualizados
   * @returns Observable con el usuario actualizado
   */
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Elimina un usuario del sistema por su ID.
   * @param id Identificador único del usuario a eliminar
   * @returns Observable vacío cuando la operación es exitosa
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
