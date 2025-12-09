import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OtpServiceService } from '../../notifications/otpService.service';
import { SecurityService } from '../security.service';
import { UserService } from '../../models/security-models/user.service';
import { SessionService } from '../../models/security-models/session.service';
import { CookieService } from 'ngx-cookie-service';
import { LoginRequest } from '../../../models/security-models/login-request.model';
import { User } from '../../../models/security-models/user.model';
import { LoginResponse } from '../../../models/security-models/login-response.model';
import { Session } from '../../../models/security-models/session.model';
import { NotificationService } from '../../notifications/notification.service';
import { jwtDecode } from 'jwt-decode';

/**
 * Servicio para autenticación tradicional con email/password + 2FA (OTP)
 *
 * Flujo de autenticación:
 * 1. Valida credenciales (email/password) en el backend
 * 2. Genera y envía código OTP de 6 dígitos por correo
 * 3. Valida el código OTP ingresado por el usuario
 * 4. Genera token JWT y crea sesión
 * 5. Guarda token en cookie segura con duración de 1 semana
 * 6. Redirige al dashboard
 *
 * @author Alan Soto
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class TraditionalLoginService {
  private readonly TOKEN_EXPIRATION_DAYS = 7; // Duración de la cookie: 1 semana

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private otpService: OtpServiceService,
    private securityService: SecurityService,
    private userService: UserService,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private notificationService: NotificationService
  ) {}

  /**
   * Valida las credenciales del usuario y genera código OTP
   *
   * @param credentials - Email y contraseña del usuario
   * @returns Observable<boolean> - true si las credenciales son válidas y se envió el OTP
   */
  verifyCredentialsAndSendOtp(credentials: LoginRequest): Observable<boolean> {
    return new Observable(observer => {
      // Verificar las credenciales (email y password) en el backend
      this.securityService.verifyCredentials(credentials).subscribe({
        next: (response) => {

          if (response.valid) {
            const user: User = response.user!;
            const userName: string = user.name || credentials.email.split('@')[0];
            console.log(userName);
            // Generar y enviar código OTP de 6 dígitos al correo del usuario
            this.otpService.generateOtp(credentials.email, userName).subscribe({
              next: () => {
                console.log('✅ OTP generado y enviado al correo:', credentials.email);
                this.toastr.success('Código de verificación enviado a tu correo', 'Verificación');
                observer.next(true);
                observer.complete();
                },
              error: (err) => {
                console.error('❌ Error al generar OTP:', err);
                this.toastr.error('Error al enviar el código de verificación. Intenta de nuevo.', 'Error');
                observer.next(false);
                observer.complete();
              }
            });
          } else {
            // Las credenciales son inválidas
            this.toastr.error('Credenciales incorrectas. Verifica tu email y contraseña.', 'Error');
            observer.next(false);
            observer.complete();
          }
        },
        error: (err) => {
          console.error('❌ Error al verificar credenciales:', err);
          this.toastr.error('Email o contraseña incorrectos.', 'Error');
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Valida el código OTP ingresado por el usuario
   *
   * @param email - Email del usuario
   * @param code - Código OTP de 6 dígitos
   * @returns Observable<boolean> - true si el OTP es válido
   */
  validateOtpCode(email: string, code: string): Observable<boolean> {
    return new Observable((observer) => {
      this.otpService.validateOtp(email, code).subscribe({
        next: (isValid: boolean) => {
          if (isValid) {
            console.log('✅ OTP válido - Procediendo con login');
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
   * Completa el proceso de login después de validar el código OTP
   *
   * Flujo:
   * 1. Genera el token JWT con el ID del usuario
   * 2. Crea la sesión en el backend
   * 3. Guarda el token en una cookie segura con expiración de 1 semana
   * 4. Muestra mensaje de éxito
   * 5. Redirige al dashboard después de 2 segundos
   *
   * @param userId - ID del usuario autenticado
   * @param email - Email del usuario autenticado
   */
  completeLogin(userId: string, email: string): void {
    this.securityService.generateToken(userId).subscribe({
      next: (loginResponse: LoginResponse) => {

        const session: Session = {
          token: loginResponse.token,
          expiration: loginResponse.expiration,
          user: loginResponse.user
        };
        console.log(session);

        this.sessionService.createSession(session).subscribe({
          next: (createdSession) => {

            this.cookieService.set('token', createdSession.token!, {
              path: '/',
              expires: this.TOKEN_EXPIRATION_DAYS,
              sameSite: 'Strict',
              secure: true
            } as any);

            sessionStorage.setItem('user', JSON.stringify(loginResponse.user));

            // Decodificar token y guardar datos en localStorage
            try {
              const decoded: any = jwtDecode(createdSession.token!);
              if (decoded) {
                localStorage.setItem('userName', decoded.name || decoded.sub || '');
                localStorage.setItem('userEmail', decoded.email || '');
                console.log('✅ Datos de usuario guardados en localStorage desde token');
              }
            } catch (e) {
              console.error('Error decodificando token', e);
            }

            this.toastr.success('Sesión iniciada correctamente', 'Login Exitoso');

            const userName = loginResponse.user.name || email.split('@')[0];
            this.notificationService.sendLoginNotification(email, userName).subscribe();

            setTimeout(() => {
              this.router.navigate(['/main']);
            }, 2000);
          },
          error: (err) => {
            console.error('❌ Error al crear sesión:', err);
            this.toastr.error('Error al crear sesión. Intenta de nuevo.', 'Error');
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al generar token:', err);
        this.toastr.error('Error al iniciar sesión. Intenta de nuevo.', 'Error');
      }
    });
  }
}
