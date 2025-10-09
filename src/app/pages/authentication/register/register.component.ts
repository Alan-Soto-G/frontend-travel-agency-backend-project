// angular import
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TraditionalRegisterService } from '../../../services/authentication/register/traditional-register.service';
import { GoogleRegisterService } from '../../../services/authentication/register/google-register.service';
import { MicrosoftRegisterService } from '../../../services/authentication/register/microsoft-register.service';
import { GithubRegisterService } from '../../../services/authentication/register/github-register.service';

/**
 * Componente de Registro con múltiples opciones:
 * - Registro tradicional con nombre, email y contraseña + verificación OTP
 * - Registro con Google (OAuth)
 * - Registro con Microsoft (OAuth)
 * - Registro con GitHub (OAuth)
 *
 * Flujo de registro tradicional:
 * 1. Usuario ingresa nombre, email y contraseña
 * 2. Se valida que el email no exista en el sistema
 * 3. Se genera y envía un código OTP por correo
 * 4. Usuario ingresa el código de 6 dígitos en el modal
 * 5. Se valida el código OTP
 * 6. Se crea el usuario en el backend
 * 7. Se redirige al login para iniciar sesión
 *
 * @author Alan Soto
 * @version 1.0
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // =================================================================
  // Component Properties
  // =================================================================

  /**
   * Datos del formulario de registro
   */
  public registerData: { name: string; email: string; password: string; confirmPassword: string } = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  /**
   * Array que almacena los 6 dígitos del código de verificación OTP
   */
  public verificationCode: string[] = ['', '', '', '', '', ''];

  /**
   * Referencia al modal de verificación OTP
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

  public isLoading: boolean = false;
  public isOtpStep: boolean = false;

  // =================================================================
  // Constructor
  // =================================================================

  constructor(
    private toastr: ToastrService,
    private traditionalRegisterService: TraditionalRegisterService,
    private googleRegisterService: GoogleRegisterService,
    private microsoftRegisterService: MicrosoftRegisterService,
    private githubRegisterService: GithubRegisterService
  ) {}

  /**
   * Getter que determina si es horario nocturno
   */
  get isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 5;
  }

  // =================================================================
  // Register Form Logic
  // =================================================================

  /**
   * Inicia el proceso de registro tradicional
   */
  public startRegistration(registerForm: NgForm): void {
    if (this.isLoading) return;

    // Validar formulario
    if (!registerForm.valid) {
      this.toastr.error('Por favor rellena los campos de manera correcta.', 'Error');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toastr.error('Las contraseñas no coinciden.', 'Error');
      return;
    }

    this.isLoading = true;
    // Verificar email y enviar OTP
    this.traditionalRegisterService.verifyEmailAndSendOtp(this.registerData.email, this.registerData.name).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.isOtpStep = true;
          // Abrir el modal de verificación
          this.verifModal.nativeElement.showModal();

          // Hacer foco en el primer input
          setTimeout(() => this.input1.nativeElement.focus(), 100);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Valida el código OTP y crea el usuario si es correcto
   */
  public verifyCode(): void {
    if (this.isLoading) return;

    if (!this.isCodeComplete()) {
      this.toastr.warning('Por favor, completa todos los dígitos.', 'Código incompleto');
      return;
    }

    const code = this.verificationCode.join('');
    this.isLoading = true;
    this.traditionalRegisterService.validateOtpCode(this.registerData.email, code).subscribe({
      next: (isValid) => {
        if (isValid) {
          // Cerrar el modal
          this.closeModal();

          // Completar el registro
          this.createUser();
        } else {
          this.isLoading = false;
          // Limpiar inputs
          this.verificationCode = ['', '', '', '', '', ''];
          this.input1.nativeElement.focus();
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Crea el usuario en el backend
   */
  private createUser(): void {
    this.traditionalRegisterService.createUser({
      name: this.registerData.name,
      email: this.registerData.email,
      password: this.registerData.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isOtpStep = false;
        this.resetForm();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // =================================================================
  // OTP Modal Logic
  // =================================================================

  /**
   * Maneja el input de cada dígito del código de verificación
   */
  public onCodeInput(event: Event, position: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Validar que solo se ingresen dígitos
    if (!/^[0-9]?$/.test(value)) {
      input.value = '';
      this.verificationCode[position - 1] = '';
      return;
    }

    this.verificationCode[position - 1] = value;

    // Mover al siguiente input
    if (value && position < 6) {
      const nextInput = this[`input${position + 1}` as keyof this] as ElementRef;
      nextInput?.nativeElement.focus();
    }

    // Si es el último dígito y está completo, validar
    if (position === 6 && this.isCodeComplete()) {
      this.verifyCode();
    }
  }

  /**
   * Maneja la tecla Backspace
   */
  public onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      const prevInput = this[`input${index}` as keyof this] as ElementRef;
      prevInput?.nativeElement.focus();
    }
  }

  /**
   * Cierra el modal de verificación
   */
  public closeModal(): void {
    this.verifModal.nativeElement.close();
  }

  /**
   * Verifica si todos los dígitos están completos
   */
  private isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }

  private resetForm(): void {
    this.registerData = { name: '', email: '', password: '', confirmPassword: '' };
    this.verificationCode = ['', '', '', '', '', ''];
  }

  // =================================================================
  // OAuth Register Methods
  // =================================================================

  /**
   * Inicia el flujo de registro con Google
   */
  async registerWithGoogle(): Promise<void> {
    await this.googleRegisterService.register();
  }

  /**
   * Inicia el flujo de registro con GitHub
   */
  async registerWithGithub(): Promise<void> {
    await this.githubRegisterService.register();
  }

  /**
   * Inicia el flujo de registro con Microsoft
   */
  async registerWithMicrosoft(): Promise<void> {
    await this.microsoftRegisterService.register();
  }
}
