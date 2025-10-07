import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Permission } from '../../models/permission.model';
import { environment } from 'src/environments/environment';
import { LoginResponse } from '../../models/login-response.model';
import { LoginRequest } from '../../models/login-request.model';

/**
 * Interfaz para la respuesta de verificación de credenciales.
 */
export interface VerifyCredentialsResponse {
  valid: boolean;
  user?: User;
  error?: string;
}

/**
 * Servicio para gestionar la autenticación y autorización del sistema.
 * Maneja operaciones de login, verificación de credenciales y generación de tokens.
 * Utiliza HttpClient para comunicarse con el endpoint público de seguridad.
 */
@Injectable({ providedIn: 'root' })
export class SecurityService {
  /**
   * URL base de la API pública de seguridad.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}public/security`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene un usuario por su email.
   * Devuelve los datos del usuario sin la contraseña.
   * @param email Email del usuario a buscar
   * @returns Observable con el usuario (sin password) si existe
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${email}`);
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * Endpoint público para crear nuevos usuarios con validaciones y encriptación.
   * @param newUser Usuario con name, email y password
   * @returns Observable con el usuario creado (sin password)
   */
  register(newUser: User): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.apiUrl}/register`, newUser);
  }

  /**
   * Autentica un usuario en el sistema mediante email y contraseña.
   * Endpoint completo que verifica credenciales y genera token en un solo paso.
   * Retorna el token JWT, datos del usuario y fecha de expiración del token.
   * @param user Objeto usuario con email y password
   * @returns Observable con la respuesta del login (token, user, expiration)
   */
  login(user: User): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, user);
  }

  /**
   * Verifica las credenciales del usuario sin generar token.
   * Útil para validaciones intermedias o flujos de autenticación de dos pasos.
   * @param credentials Objeto con email y password
   * @returns Observable con la validación y datos del usuario (sin password)
   */
  verifyCredentials(credentials: { email: string; password: string }): Observable<VerifyCredentialsResponse> {
    console.log(credentials);
    return this.http.post<VerifyCredentialsResponse>(`${this.apiUrl}/verify-credentials`, credentials);
  }

  /**
   * Genera un token JWT para un usuario ya autenticado.
   * Requiere el _id del usuario obtenido en la verificación de credenciales.
   * @param userId ID del usuario (_id)
   * @returns Observable con el token, fecha de expiración y usuario
   */
  generateToken(userId: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/generate-token`, { _id: userId });
  }

  /**
   * Valida si el usuario tiene permiso para acceder a un recurso específico.
   * Envía la URL y el método HTTP para verificar permisos según roles.
   * @param permission Objeto con url y method a validar
   * @returns Observable con booleano indicando si tiene permiso
   */
  validatePermissions(permission: Permission): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/permissions-validation`, permission);
  }

  /**
   * Guarda el token JWT en el almacenamiento local del navegador.
   * @param token Token JWT recibido del backend
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Obtiene el token JWT almacenado en el navegador.
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Elimina el token JWT del almacenamiento local (logout local).
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Verifica si el usuario está autenticado comprobando la existencia del token.
   * @returns true si existe un token almacenado
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
