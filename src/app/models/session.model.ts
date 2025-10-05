import { User } from './user.model';

/**
 * Modelo que representa una sesión JWT en el sistema.
 * Contiene el token de autenticación, fecha de expiración y usuario asociado.
 */
export interface Session {
  /**
   * Identificador único de la sesión (MongoDB _id)
   */
  _id?: string;

  /**
   * Token JWT generado para la sesión
   */
  token?: string;

  /**
   * Fecha y hora de expiración del token
   */
  expiration?: Date;

  /**
   * Usuario asociado a esta sesión
   */
  user?: User;
}
