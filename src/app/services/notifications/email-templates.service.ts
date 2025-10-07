import { Injectable } from '@angular/core';
/**
 * Servicio para gestionar templates de correos electrónicos HTML reutilizables.
 * Proporciona templates predefinidos con estilos consistentes para diferentes tipos de notificaciones.
 *
 * @author Alan Soto
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class EmailTemplatesService {

  constructor() { }

  /**
   * Genera el template HTML para el correo de notificación de nuevo inicio de sesión
   *
   * @param email - Email del usuario que inició sesión
   * @param userName - Nombre del usuario para personalizar el saludo (opcional)
   * @param date - Fecha y hora del inicio de sesión (opcional, usa fecha actual si no se proporciona)
   * @returns Template HTML completo del correo
   */
  getLoginNotificationTemplate(email: string, userName?: string, date?: Date): string {
    const loginDate = date || new Date();
    const formattedDate = loginDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const greeting = userName ? `¡Hola, ${userName}!` : '¡Hola!';

    return `
      <table width='600' cellpadding='0' cellspacing='0' style='background-color: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;'>
        <tr>
          <td style='padding: 50px 40px; text-align: center;'>
            <div style='margin-bottom: 30px;'>
              <span style='font-size: 60px;'>🔐</span>
            </div>
            <h2 style='color: #333; margin: 0 0 10px 0; font-size: 24px;'>${greeting}</h2>
            <h3 style='color: #555; margin: 0 0 20px 0; font-size: 20px; font-weight: normal;'>Nuevo Inicio de Sesión Detectado</h3>
            <p style='color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;'>
              Hemos detectado un nuevo inicio de sesión en tu cuenta.
            </p>

            <div style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(17, 153, 142, 0.3);'>
              <p style='color: white; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;'>Detalles del Acceso</p>
              <div style='background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 20px; text-align: left;'>
                <p style='color: white; font-size: 14px; margin: 0 0 10px 0;'>
                  <strong>📧 Cuenta:</strong> ${email}
                </p>
                <p style='color: white; font-size: 14px; margin: 0;'>
                  <strong>📅 Fecha y hora:</strong> ${formattedDate}
                </p>
              </div>
            </div>

            <div style='background-color: #fff9e6; border-left: 4px solid #ffa500; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;'>
              <p style='color: #666; font-size: 14px; margin: 0; line-height: 1.6;'>
                <strong style='color: #ffa500;'>⚠️ ¿Fuiste tú?</strong><br><br>
                • Si reconoces esta actividad, puedes ignorar este mensaje ✅<br>
                • Si NO fuiste tú, te recomendamos cambiar tu contraseña inmediatamente 🚨<br>
                • Contacta con soporte si necesitas ayuda 💬
              </p>
            </div>

            <div style='margin-top: 40px;'>
              <a href='#' style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);'>
                Cambiar Contraseña
              </a>
            </div>

            <p style='color: #999; font-size: 13px; margin: 30px 0 0 0; line-height: 1.5;'>
              Este es un mensaje automático de seguridad. Por favor no respondas a este correo.<br>
              Si tienes dudas, contacta con nuestro equipo de soporte.
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Genera el template HTML para correos de bienvenida
   *
   * @param userName - Nombre del usuario
   * @returns Template HTML completo del correo
   */
  getWelcomeTemplate(userName: string): string {
    return `
      <table width='600' cellpadding='0' cellspacing='0' style='background-color: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;'>
        <tr>
          <td style='padding: 50px 40px; text-align: center;'>
            <div style='margin-bottom: 30px;'>
              <span style='font-size: 60px;'>🎉</span>
            </div>
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 24px;'>¡Bienvenido, ${userName}!</h2>
            <p style='color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;'>
              Nos alegra tenerte con nosotros. Tu cuenta ha sido creada exitosamente.
            </p>

            <div style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(240, 147, 251, 0.3);'>
              <p style='color: white; font-size: 14px; margin: 0; line-height: 1.8;'>
                Ahora puedes disfrutar de todas las funcionalidades de nuestra plataforma.
              </p>
            </div>

            <p style='color: #999; font-size: 13px; margin: 30px 0 0 0; line-height: 1.5;'>
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Genera el template HTML para notificación de cambio de contraseña
   *
   * @param userName - Nombre del usuario
   * @returns Template HTML completo del correo
   */
  getPasswordChangeTemplate(userName: string): string {
    const changeDate = new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <table width='600' cellpadding='0' cellspacing='0' style='background-color: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;'>
        <tr>
          <td style='padding: 50px 40px; text-align: center;'>
            <div style='margin-bottom: 30px;'>
              <span style='font-size: 60px;'>🔒</span>
            </div>
            <h2 style='color: #333; margin: 0 0 10px 0; font-size: 24px;'>¡Hola, ${userName}!</h2>
            <h3 style='color: #555; margin: 0 0 20px 0; font-size: 20px; font-weight: normal;'>Contraseña Actualizada</h3>
            <p style='color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;'>
              Tu contraseña ha sido actualizada exitosamente.
            </p>

            <div style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(17, 153, 142, 0.3);'>
              <p style='color: white; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;'>Detalles del Cambio</p>
              <div style='background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 20px; text-align: left;'>
                <p style='color: white; font-size: 14px; margin: 0;'>
                  <strong>📅 Fecha y hora:</strong> ${changeDate}
                </p>
              </div>
            </div>

            <div style='background-color: #fff9e6; border-left: 4px solid #ffa500; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;'>
              <p style='color: #666; font-size: 14px; margin: 0; line-height: 1.6;'>
                <strong style='color: #ffa500;'>⚠️ ¿No fuiste tú?</strong><br><br>
                Si no realizaste este cambio, contacta inmediatamente con nuestro equipo de soporte.
              </p>
            </div>

            <p style='color: #999; font-size: 13px; margin: 30px 0 0 0; line-height: 1.5;'>
              Este es un mensaje automático de seguridad. Por favor no respondas a este correo.
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Genera el template HTML para alertas de seguridad genéricas
   *
   * @param userName - Nombre del usuario
   * @param alertMessage - Mensaje de alerta personalizado
   * @returns Template HTML completo del correo
   */
  getSecurityAlertTemplate(userName: string, alertMessage: string): string {
    const alertDate = new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <table width='600' cellpadding='0' cellspacing='0' style='background-color: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;'>
        <tr>
          <td style='padding: 50px 40px; text-align: center;'>
            <div style='margin-bottom: 30px;'>
              <span style='font-size: 60px;'>⚠️</span>
            </div>
            <h2 style='color: #333; margin: 0 0 10px 0; font-size: 24px;'>¡Hola, ${userName}!</h2>
            <h3 style='color: #d32f2f; margin: 0 0 20px 0; font-size: 20px; font-weight: normal;'>Alerta de Seguridad</h3>

            <div style='background: linear-gradient(135deg, #f5576c 0%, #d32f2f 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(211, 47, 47, 0.3);'>
              <p style='color: white; font-size: 16px; margin: 0; line-height: 1.8;'>
                ${alertMessage}
              </p>
            </div>

            <div style='background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 20px; margin: 20px 0;'>
              <p style='color: #666; font-size: 14px; margin: 0;'>
                <strong>📅 Fecha:</strong> ${alertDate}
              </p>
            </div>

            <div style='background-color: #ffebee; border-left: 4px solid #d32f2f; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;'>
              <p style='color: #666; font-size: 14px; margin: 0; line-height: 1.6;'>
                <strong style='color: #d32f2f;'>🚨 Acción Recomendada</strong><br><br>
                • Revisa la actividad reciente de tu cuenta<br>
                • Considera cambiar tu contraseña<br>
                • Contacta con soporte si necesitas ayuda
              </p>
            </div>

            <div style='margin-top: 40px;'>
              <a href='#' style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);'>
                Revisar Cuenta
              </a>
            </div>

            <p style='color: #999; font-size: 13px; margin: 30px 0 0 0; line-height: 1.5;'>
              Este es un mensaje automático de seguridad. Por favor no respondas a este correo.
            </p>
          </td>
        </tr>
      </table>
    `;
  }
}
