import { User } from './user.model';
/**
 * Modelo que representa la respuesta del endpoint de login.
 * Contiene el token JWT, usuario autenticado y fecha de expiración.
 */
export interface LoginResponse {
  /**
   * Token JWT generado para la sesión del usuario
   */
  token: string;

  /**
   * Datos del usuario autenticado (sin contraseña)
   */
  user: User;

  /**
   * Fecha y hora de expiración del token JWT
   */
  expiration: Date;
}
