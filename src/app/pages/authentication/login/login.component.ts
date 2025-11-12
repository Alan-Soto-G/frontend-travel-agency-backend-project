import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginRequest } from '../../../models/security-models/login-request.model';
import { RecapchaComponent } from 'src/app/components/recapcha/recapcha.component';
import { TraditionalLoginService } from '../../../services/authentication/login/traditional-login.service';
import { GoogleLoginService } from '../../../services/authentication/login/google-login.service';
import { GithubLoginService } from '../../../services/authentication/login/github-login.service';
import { MicrosoftLoginService } from '../../../services/authentication/login/microsoft-login.service';
import { SecurityService } from '../../../services/authentication/security.service';

/**
 * Componente de Login con múltiples opciones de autenticación:
 * - Login tradicional con email/contraseña + 2FA (OTP por correo)
 * - Login con Google (OAuth)
 * - Login con GitHub (OAuth)
 * - Login con Microsoft (OAuth)
 * - Protección con reCAPTCHA
 *
 * @author Alan Soto
 * @version 3.0 - Refactorizado con servicios separados
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, RecapchaComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // =================================================================
  // Component Properties
  // =================================================================

  /**
   * Datos del formulario de login (email y contraseña)
   */
  public loginData: LoginRequest = { email: '', password: '' };

  /**
   * Array que almacena los 6 dígitos del código de verificación OTP
   */
  public verificationCode: string[] = ['', '', '', '', '', ''];

  /**
   * Token del reCAPTCHA para verificación anti-bot
   */
  public captchaToken: string | null = null;

  /**
   * Referencia al modal de verificación 2FA
   */
  @ViewChild('verifModal') private verifModal!: ElementRef<HTMLDialogElement>;

  /**
   * Referencias a los 6 inputs del código de verificación
   */
  @ViewChild('input1') private input1!: ElementRef<HTMLInputElement>;
  @ViewChild('input2') private input2!: ElementRef<HTMLInputElement>;
  @ViewChild('input3') private input3!: ElementRef<HTMLInputElement>;
  @ViewChild('input4') private input4!: ElementRef<HTMLInputElement>;
  @ViewChild('input5') private input5!: ElementRef<HTMLInputElement>;
  @ViewChild('input6') private input6!: ElementRef<HTMLInputElement>;

  // =================================================================
  // Constructor
  // =================================================================

  constructor(
    private toastr: ToastrService,
    private ngZone: NgZone,
    private traditionalLoginService: TraditionalLoginService,
    private googleLoginService: GoogleLoginService,
    private githubLoginService: GithubLoginService,
    private microsoftLoginService: MicrosoftLoginService,
    private securityService: SecurityService
  ) {}

  /**
   * Getter que determina si es horario nocturno
   * Se utiliza para cambiar la imagen de fondo del login
   */
  get isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 5;
  }

  // =================================================================
  // Traditional Login (Email/Password + 2FA)
  // =================================================================

  /**
   * Método principal que inicia el proceso de autenticación tradicional
   * Valida credenciales y envía código OTP
   */
  public verificationInfo(loginForm: NgForm): void {
    if (!loginForm.valid) {
      this.toastr.error('Por favor rellena los campos de manera correcta.', 'Error');
      return;
    }

    this.traditionalLoginService.verifyCredentialsAndSendOtp(this.loginData).subscribe({
      next: (success) => {
        if (success) {
          // Abrir el modal de verificación 2FA
          this.verifModal.nativeElement.showModal();
          setTimeout(() => this.input1.nativeElement.focus(), 100);
        }
      }
    });
  }

  /**
   * Valida el código OTP de 6 dígitos
   */
  public verifyCode(): void {
    if (!this.isCodeComplete()) {
      this.toastr.warning('Por favor, completa todos los dígitos.', 'Código incompleto');
      return;
    }

    const code = this.verificationCode.join('');
    console.log('🔍 Validando código:', code);

    this.traditionalLoginService.validateOtpCode(this.loginData.email, code).subscribe({
      next: (isValid: boolean) => {
        if (isValid) {
          this.closeModal();
          // Get user by email to obtain userId for completeLogin
          this.securityService.getUserByEmail(this.loginData.email).subscribe({
            next: (response) => {
              if (response.exists && response.user && response.user._id) {
                this.traditionalLoginService.completeLogin(response.user._id, this.loginData.email);
              } else {
                this.toastr.error('Usuario no encontrado', 'Error');
              }
            },
            error: (err) => {
              console.error('❌ Error al obtener usuario:', err);
              this.toastr.error('Error al completar el login', 'Error');
            }
          });
        } else {
          this.toastr.error('Código OTP inválido. Por favor, inténtalo de nuevo.', 'Error de validación');
          this.verificationCode = ['', '', '', '', '', ''];
          this.input1.nativeElement.focus();
        }
      },
      error: () => {
        this.verificationCode = ['', '', '', '', '', ''];
        this.input1.nativeElement.focus();
      }
    });
  }

  // =================================================================
  // 2FA Modal Logic
  // =================================================================

  /**
   * Maneja el input de cada dígito del código de verificación
   */
  public onCodeInput(event: Event, position: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.verificationCode[position - 1] = '';
      return;
    }

    if (value && position < 6) {
      const nextInput = this[`input${position + 1}` as keyof this] as ElementRef;
      nextInput?.nativeElement.focus();
    }

    if (position === 6 && this.isCodeComplete()) {
      this.verifyCode();
    }
  }

  /**
   * Maneja la tecla Backspace para navegación entre inputs
   */
  public onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      const prevInput = this[`input${index}` as keyof this] as ElementRef;
      prevInput?.nativeElement.focus();
    }
  }

  /**
   * Cierra el modal de verificación 2FA
   */
  public closeModal(): void {
    this.verifModal.nativeElement.close();
  }

  /**
   * Verifica si todos los 6 dígitos del código han sido ingresados
   */
  private isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }

  // =================================================================
  // OAuth Login Methods
  // =================================================================

  /**
   * Callback que se ejecuta cuando el usuario completa el reCAPTCHA
   */
  public onCaptchaResolved(token: string): void {
    this.ngZone.run(() => {
      console.log('✅ Captcha resuelto:', token);
      this.captchaToken = token;
    });
  }

  /**
   * Inicia el flujo de autenticación con Google OAuth
   */
  public async loginWithGoogle(): Promise<void> {
    await this.googleLoginService.login();
  }

  /**
   * Inicia el flujo de autenticación con GitHub OAuth
   */
  public async loginWithGithub(): Promise<void> {
    await this.githubLoginService.login();
  }

  /**
   * Inicia el flujo de autenticación con Microsoft OAuth
   */
  public async loginWithMicrosoft(): Promise<void> {
    await this.microsoftLoginService.login();
  }
}
