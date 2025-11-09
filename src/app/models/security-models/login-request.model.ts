/**
 * Modelo que representa las credenciales para el login.
 * Se envía al backend para autenticación.
 */
export interface LoginRequest {
  /**
   * Email del usuario
   */
  email: string;

  /**
   * Contraseña del usuario (será encriptada en el backend)
   */
  password: string;
}
