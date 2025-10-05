import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginRequest } from '../../../models/login-request.model';
import { UserService } from '../../../services/user.service';
import { OtpServiceService } from '../../../services/otpService.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../../../models/user.model';
import { SessionService } from 'src/app/services/session.service';
import { SecurityService } from '../../../services/security.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../../../models/login-response.model';
import { Session } from '../../../models/session.model';

/**
 * Componente de Login con autenticación de dos factores (2FA)
 * Flujo de autenticación:
 * 1. Usuario ingresa email y contraseña
 * 2. Se validan las credenciales en el backend
 * 3. Si son correctas, se genera y envía un código OTP por correo
 * 4. Usuario ingresa el código de 6 dígitos en el modal
 * 5. Se valida el código OTP
 * 6. Se genera el token JWT y se crea la sesión
 * 7. Se guarda el token en una cookie segura
 * 8. Se redirige al dashboard principal
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // =================================================================
  // Component Properties
  // =================================================================

  /**
   * Datos del formulario de login (email y contraseña)
   * Se vincula con ngModel en el template
   */
  public loginData: LoginRequest = { email: '', password: '' };

  /**
   * Array que almacena los 6 dígitos del código de verificación OTP
   * Cada elemento representa un input individual en el modal 2FA
   */
  public verificationCode: string[] = ['', '', '', '', '', ''];

  /**
   * Referencia al modal de verificación 2FA
   * Se utiliza para abrir/cerrar el modal programáticamente
   */
  @ViewChild('verifModal') private verifModal!: ElementRef<HTMLDialogElement>;

  /**
   * Referencias a los 6 inputs del código de verificación
   * Se utilizan para manejar el foco automático entre inputs
   */
  @ViewChild('input1') private input1!: ElementRef<HTMLInputElement>;
  @ViewChild('input2') private input2!: ElementRef<HTMLInputElement>;
  @ViewChild('input3') private input3!: ElementRef<HTMLInputElement>;
  @ViewChild('input4') private input4!: ElementRef<HTMLInputElement>;
  @ViewChild('input5') private input5!: ElementRef<HTMLInputElement>;
  @ViewChild('input6') private input6!: ElementRef<HTMLInputElement>;

  // =================================================================
  // Lifecycle & Constructor
  // =================================================================

  /**
   * Constructor del componente
   * Inyecta todos los servicios necesarios para el flujo de autenticación
   *
   * @param toastr - Servicio para mostrar notificaciones toast
   * @param userService - Servicio para operaciones CRUD de usuarios
   * @param otpService - Servicio para generar y validar códigos OTP
   * @param cookieService - Servicio para gestionar cookies del navegador
   * @param sessionService - Servicio para gestionar sesiones JWT
   * @param router - Servicio de enrutamiento de Angular
   * @param securityService - Servicio para autenticación y seguridad
   */
  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private otpService: OtpServiceService,
    private cookieService: CookieService,
    private sessionService: SessionService,
    private router: Router,
    private securityService: SecurityService
  ) {}

  /**
   * Getter que determina si es horario nocturno
   * Se utiliza para cambiar la imagen de fondo del login
   *
   * @returns true si es entre las 18:00 y 05:00, false en caso contrario
   */
  get isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 5;
  }

  // =================================================================
  // Login Form Logic
  // =================================================================

  /**
   * Método principal que inicia el proceso de autenticación
   *
   * Paso 1: Valida el formulario de login
   * Paso 2: Verifica las credenciales en el backend
   * Paso 3: Si son correctas, genera y envía el código OTP por correo
   * Paso 4: Abre el modal de verificación 2FA
   *
   * @param loginForm - Referencia al formulario de login para validación
   */
  public verificationInfo(loginForm: NgForm): void {
    // Validar que todos los campos estén completos y correctos
    if (!loginForm.valid) {
      this.toastr.error('Por favor rellena los campos de manera correcta.', 'Error');
      return;
    }

    // Verificar las credenciales (email y password) en el backend
    this.securityService.verifyCredentials({
      email: this.loginData.email,
      password: this.loginData.password
    }).subscribe({
      next: (response) => {
        // Las credenciales son válidas
        if (response.valid) {
          // Generar y enviar código OTP de 6 dígitos al correo del usuario
          this.otpService.generateOtp(this.loginData.email).subscribe({
            next: (_code) => {
              console.log('✅ OTP generado y enviado al correo:', this.loginData.email);

              // Abrir el modal de verificación 2FA
              this.verifModal.nativeElement.showModal();

              // Hacer foco automático en el primer input después de 100ms
              setTimeout(() => this.input1.nativeElement.focus(), 100);
            },
            error: (err) => {
              console.error('❌ Error al generar OTP:', err);
              this.toastr.error('Error al enviar el código de verificación. Intenta de nuevo.', 'Error');
            }
          });
        } else {
          // Las credenciales son inválidas
          this.toastr.error('Credenciales incorrectas. Verifica tu email y contraseña.', 'Error');
        }
      },
      error: (err) => {
        console.error('❌ Error al verificar credenciales:', err);
        this.toastr.error('Email o contraseña incorrectos.', 'Error');
      }
    });
  }

  /**
   * Método que completa el proceso de login después de validar el código OTP
   *
   * Flujo:
   * 1. Obtiene el usuario por email
   * 2. Genera el token JWT con el ID del usuario
   * 3. Crea la sesión en el backend
   * 4. Guarda el token en una cookie segura con expiración de 5 minutos
   * 5. Muestra mensaje de éxito
   * 6. Redirige al dashboard después de 3 segundos
   */
  public onLogin(): void {
    // Obtener los datos completos del usuario por su email
    this.userService.getUserByEmail(this.loginData.email).subscribe({
      next: (user: User) => {
        // Generar token JWT utilizando el ID del usuario
        this.securityService.generateToken(user._id!).subscribe({
          next: (loginResponse: LoginResponse) => {
            // Crear objeto Session compatible con el backend
            const session: Session = {
              token: loginResponse.token,
              expiration: loginResponse.expiration,
              user: loginResponse.user
            };

            // Persistir la sesión en el backend (MongoDB)
            this.sessionService.createSession(session).subscribe({
              next: (createdSession) => {
                // Guardar el token JWT en una cookie segura del navegador
                // Configuración:
                // - path: '/' -> disponible en toda la aplicación
                // - maxAge: 300 -> expira en 5 minutos (300 segundos)
                // - sameSite: 'Strict' -> protección contra CSRF
                this.cookieService.set('token', createdSession.token!, {
                  path: '/',
                  maxAge: 300,
                  sameSite: 'Strict'
                } as any);

                // Mostrar notificación de éxito al usuario
                this.toastr.success('Sesión iniciada', 'Login');

                // Redirigir al dashboard principal después de 3 segundos
                // Esto da tiempo al usuario de ver el mensaje de éxito
                setTimeout(() => {
                  this.router.navigate(['/main']);
                }, 3000);
              },
              error: (err) => {
                console.error('❌ Error al crear sesión:', err);
                this.toastr.error('Error al crear sesión. Intenta de nuevo.', 'Error');
              }
            });
          },
          error: (err) => {
            console.error('❌ Error al hacer login:', err);
            this.toastr.error('Error al iniciar sesión. Intenta de nuevo.', 'Error');
          }
        });
      },
      error: () => {
        this.toastr.error('Error al iniciar sesión.', 'Error');
      }
    });
  }

  // =================================================================
  // 2FA Modal Logic
  // =================================================================

  /**
   * Maneja el input de cada dígito del código de verificación
   *
   * Funcionalidades:
   * - Valida que solo se ingresen números
   * - Mueve el foco automáticamente al siguiente input
   * - Valida el código cuando se completa el último dígito
   *
   * @param event - Evento del input
   * @param position - Posición del input (1-6)
   */
  public onCodeInput(event: Event, position: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Validar que solo se ingresen dígitos numéricos
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.verificationCode[position - 1] = '';
      return;
    }

    // Si hay un valor y no es el último input, mover al siguiente
    if (value && position < 6) {
      const nextInput = this[`input${position + 1}` as keyof this] as ElementRef;
      nextInput?.nativeElement.focus();
    }

    // Si es el último dígito y el código está completo, validar automáticamente
    if (position === 6 && this.isCodeComplete()) {
      this.verifyCode();
    }
  }

  /**
   * Maneja la tecla Backspace para navegación entre inputs
   * Permite retroceder al input anterior cuando se borra un dígito
   *
   * @param event - Evento del teclado
   * @param index - Índice del input actual (0-5)
   */
  public onKeyDown(event: KeyboardEvent, index: number): void {
    // Si presiona Backspace, el input está vacío y no es el primero
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      // Mover el foco al input anterior
      const prevInput = this[`input${index}` as keyof this] as ElementRef;
      prevInput?.nativeElement.focus();
    }
  }

  /**
   * Valida el código OTP de 6 dígitos contra el backend
   *
   * Si es válido:
   * - Muestra mensaje de éxito
   * - Cierra el modal
   * - Procede con el login completo (genera token y sesión)
   *
   * Si es inválido:
   * - Muestra mensaje de error
   * - Limpia los inputs
   * - Permite reintentar
   */
  public verifyCode(): void {
    // Verificar que todos los dígitos estén completos
    if (!this.isCodeComplete()) {
      this.toastr.warning('Por favor, completa todos los dígitos.', 'Código incompleto');
      return;
    }

    // Unir los 6 dígitos en un string único
    const code = this.verificationCode.join('');
    console.log('🔍 Validando código:', code);

    // Enviar el código al backend para validación
    this.otpService.validateOtp(this.loginData.email, code).subscribe({
      next: (isValid) => {
        if (isValid) {
          // ✅ Código OTP válido
          console.log('✅ OTP válido - Procediendo con login');
          this.toastr.success('Código verificado correctamente.', 'Éxito');

          // Cerrar el modal de verificación
          this.closeModal();

          // Proceder con el login completo (token, sesión, redirección)
          this.onLogin();

        } else {
          // ❌ Código OTP inválido
          console.log('❌ OTP inválido');
          this.toastr.error('El código ingresado es incorrecto.', 'Error');

          // Limpiar todos los inputs para permitir reintentar
          this.verificationCode = ['', '', '', '', '', ''];

          // Hacer foco en el primer input
          this.input1.nativeElement.focus();
        }
      },
      error: (err) => {
        console.error('❌ Error al validar OTP:', err);
        this.toastr.error('Error al validar el código. Intenta de nuevo.', 'Error');
      }
    });
  }

  /**
   * Cierra el modal de verificación 2FA
   */
  public closeModal(): void {
    this.verifModal.nativeElement.close();
  }

  /**
   * Verifica si todos los 6 dígitos del código han sido ingresados
   *
   * @returns true si todos los dígitos están completos, false en caso contrario
   */
  private isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }
}
