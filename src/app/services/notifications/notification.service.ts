import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MailService } from './mail.service';
import { EmailTemplatesService } from './email-templates.service';

/**
 * Servicio centralizado para gestionar todas las notificaciones por correo electrónico
 *
 * Proporciona métodos reutilizables para enviar diferentes tipos de notificaciones:
 * - Notificación de inicio de sesión
 * - Email de bienvenida al registrarse
 * - Notificación de cambio de contraseña
 * - Alertas de seguridad
 * - Y más...
 *
 * @author Alan Soto
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private mailService: MailService,
    private emailTemplates: EmailTemplatesService
  ) {}

  /**
   * Envía una notificación de inicio de sesión al usuario
   *
   * @param email - Email del usuario
   * @param userName - Nombre del usuario (opcional, se extrae del email si no se proporciona)
   * @returns Observable<void>
   */
  sendLoginNotification(email: string, userName?: string): Observable<void> {
    return new Observable(observer => {
      const name = userName || email.split('@')[0];
      const content = this.emailTemplates.getLoginNotificationTemplate(email, name);

      this.mailService.sendMail(
        [email],
        '🔐 Nuevo inicio de sesión detectado',
        content,
        true
      ).subscribe({
        next: () => {
          console.log('✅ Notificación de inicio de sesión enviada a:', email);
          observer.next();
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Error al enviar notificación de inicio de sesión:', err);
          // No bloqueamos el flujo principal, solo logueamos el error
          observer.next();
          observer.complete();
        }
      });
    });
  }

  /**
   * Envía un email de bienvenida al usuario recién registrado
   *
   * @param email - Email del usuario
   * @param userName - Nombre del usuario
   * @returns Observable<void>
   */
  sendWelcomeEmail(email: string, userName: string): Observable<void> {
    return new Observable(observer => {
      const content = this.emailTemplates.getWelcomeTemplate(userName);

      this.mailService.sendMail(
        [email],
        '🎊 ¡Bienvenid@ a nuestra plataforma! 🎊',
        content,
        false
      ).subscribe({
        next: () => {
          console.log('✅ Email de bienvenida enviado a:', email);
          observer.next();
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Error al enviar email de bienvenida:', err);
          // No bloqueamos el flujo principal, solo logueamos el error
          observer.next();
          observer.complete();
        }
      });
    });
  }

  /**
   * Envía una notificación de cambio de contraseña
   *
   * @param email - Email del usuario
   * @param userName - Nombre del usuario
   * @returns Observable<void>
   */
  sendPasswordChangeNotification(email: string, userName?: string): Observable<void> {
    return new Observable(observer => {
      const name = userName || email.split('@')[0];
      const content = this.emailTemplates.getPasswordChangeTemplate(name);

      this.mailService.sendMail(
        [email],
        '🔒 Contraseña actualizada exitosamente',
        content,
        true
      ).subscribe({
        next: () => {
          console.log('✅ Notificación de cambio de contraseña enviada a:', email);
          observer.next();
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Error al enviar notificación de cambio de contraseña:', err);
          observer.next();
          observer.complete();
        }
      });
    });
  }

  /**
   * Envía una alerta de seguridad genérica
   *
   * @param email - Email del usuario
   * @param userName - Nombre del usuario
   * @param alertMessage - Mensaje de alerta personalizado
   * @returns Observable<void>
   */
  sendSecurityAlert(email: string, userName: string, alertMessage: string): Observable<void> {
    return new Observable(observer => {
      const content = this.emailTemplates.getSecurityAlertTemplate(userName, alertMessage);

      this.mailService.sendMail(
        [email],
        '⚠️ Alerta de seguridad',
        content,
        true
      ).subscribe({
        next: () => {
          console.log('✅ Alerta de seguridad enviada a:', email);
          observer.next();
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Error al enviar alerta de seguridad:', err);
          observer.next();
          observer.complete();
        }
      });
    });
  }

  /**
   * Envía un correo personalizado
   *
   * @param email - Email del destinatario
   * @param subject - Asunto del correo
   * @param content - Contenido del correo
   * @param isHtml - Si el contenido es HTML
   * @returns Observable<void>
   */
  sendCustomEmail(email: string, subject: string, content: string, isHtml: boolean = true): Observable<void> {
    return new Observable(observer => {
      this.mailService.sendMail([email], subject, content, isHtml).subscribe({
        next: () => {
          console.log('✅ Email personalizado enviado a:', email);
          observer.next();
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Error al enviar email personalizado:', err);
          observer.next();
          observer.complete();
        }
      });
    });
  }
}

