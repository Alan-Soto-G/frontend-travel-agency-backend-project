import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OtpServiceService } from '../../notifications/otpService.service';
import { SecurityService } from '../security.service';
import { User } from '../../../models/security-models/user.model';
import { NotificationService } from '../../notifications/notification.service';

/**
 * Servicio para registro tradicional con email/password + verificación OTP
 *
 * Flujo de registro:
 * 1. Valida que el email no exista en el sistema
 * 2. Genera y envía código OTP de 6 dígitos por correo
 * 3. Valida el código OTP ingresado por el usuario
 * 4. Crea el usuario en el backend
 * 5. Redirige al login para iniciar sesión
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class TraditionalRegisterService {

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private otpService: OtpServiceService,
    private securityService: SecurityService,
    private notificationService: NotificationService
  ) {}

  /**
   * Valida que el email no exista y envía código OTP
   *
   * @param email - Email del usuario a registrar
   * @param userName - Nombre del usuario para personalizar el email
   * @returns Observable<boolean> - true si el email no existe y se envió el OTP
   */
  verifyEmailAndSendOtp(email: string, userName?: string): Observable<boolean> {
    return new Observable(observer => {
      // Verificar que el email no exista en el sistema
      this.securityService.getUserByEmail(email).subscribe({
        next: (user) => {
          // Si encuentra un usuario, significa que el email ya existe
          if (user) {
            console.log(user)
            this.toastr.error('Este correo electrónico ya está registrado.', 'Error');
            observer.next(false);
            observer.complete();
          }
        },
        error: (err) => {
          // Si es error 404, el email no existe y podemos continuar
          if (err.status === 404) {
            // Usar el nombre proporcionado o extraer del email como fallback
            const name = userName || email.split('@')[0];

            // Generar y enviar código OTP
            this.otpService.generateOtp(email, name).subscribe({
              next: () => {
                console.log('✅ OTP generado y enviado al correo:', email);
                this.toastr.success('Código de verificación enviado a tu correo.', 'Éxito');
                observer.next(true);
                observer.complete();
              },
              error: (err) => {
                console.error('❌ Error al generar OTP:', err);
                this.toastr.error('Error al enviar el código de verificación.', 'Error');
                observer.next(false);
                observer.complete();
              }
            });
          } else {
            // Otro tipo de error
            this.toastr.error('Error al verificar el correo electrónico.', 'Error');
            observer.next(false);
            observer.complete();
          }
        }
      });
    });
  }

  /**
   * Valida el código OTP ingresado por el usuario
   *
   * @param email - Email del usuario
   * @param code - Código OTP de 6 dígitos
   * @returns Observable<boolean> - true si el código es válido
   */
  validateOtpCode(email: string, code: string): Observable<boolean> {
    return new Observable(observer => {
      this.otpService.validateOtp(email, code).subscribe({
        next: (isValid) => {
          if (isValid) {
            console.log('✅ OTP válido - Procediendo con registro');
            this.toastr.success('Código verificado correctamente.', 'Éxito');
            observer.next(true);
            observer.complete();
          } else {
            console.log('❌ OTP inválido');
            this.toastr.error('El código ingresado es incorrecto.', 'Error');
            observer.next(false);
            observer.complete();
          }
        },
        error: (err) => {
          console.error('❌ Error al validar OTP:', err);
          this.toastr.error('Error al validar el código. Intenta de nuevo.', 'Error');
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Crea el usuario en el backend
   *
   * @param userData - Datos del usuario (name, email, password)
   * @returns Observable<User> - Usuario creado
   */
  createUser(userData: { name: string; email: string; password: string }): Observable<User> {
    return new Observable(observer => {
      const newUser: User = {
        name: userData.name,
        email: userData.email,
        password: userData.password
      };

      this.securityService.register(newUser).subscribe({
        next: (response) => {
          console.log('✅ Usuario creado:', response.user);
          this.toastr.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'Éxito');

          // Enviar email de bienvenida
          const userName = response.user.name || response.user.email.split('@')[0];
          this.notificationService.sendWelcomeEmail(response.user.email, userName).subscribe();

          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);

          observer.next(response.user);
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Error al crear usuario:', err);
          this.toastr.error('Error al crear la cuenta. Intenta de nuevo.', 'Error');
          observer.error(err);
        }
      });
    });
  }
}
