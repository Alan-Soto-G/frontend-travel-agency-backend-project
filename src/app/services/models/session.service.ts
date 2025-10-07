import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../../models/session.model';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones CRUD de sesiones contra la API REST.
 * Maneja la creación, consulta, actualización y eliminación de sesiones JWT.
 * Utiliza HttpClient para comunicarse con el backend de Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  /**
   * URL base de la API para sesiones.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}public/sessions`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las sesiones activas del sistema.
   * @returns Observable con un array de sesiones
   */
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  /**
   * Obtiene una sesión específica por su ID.
   * @param id Identificador único de la sesión
   * @returns Observable con la sesión encontrada
   */
  getSessionById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva sesión para un usuario.
   * Genera automáticamente el token JWT y fecha de expiración.
   * @param session Objeto sesión con el user._id
   * @returns Observable con la sesión creada (incluye token generado)
   */
  createSession(session: Session): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  /**
   * Actualiza una sesión existente (renovar token).
   * @param id Identificador único de la sesión a actualizar
   * @param session Objeto sesión con los datos actualizados
   * @returns Observable con la sesión actualizada
   */
  updateSession(id: string, session: Session): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}`, session);
  }

  /**
   * Elimina una sesión del sistema (logout).
   * @param id Identificador único de la sesión a eliminar
   * @returns Observable vacío cuando la operación es exitosa
   */
  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
