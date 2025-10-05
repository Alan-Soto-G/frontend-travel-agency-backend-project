// angular import
import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { OtpServiceService } from '../../../services/otpService.service';
import { User } from '../../../models/user.model';

/**
 * Componente de Registro con múltiples opciones:
 * - Registro tradicional con nombre, email y contraseña + verificación OTP
 * - Registro con Google (OAuth)
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

  // =================================================================
  // Constructor
  // =================================================================

  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private ngZone: NgZone,
    private authService: AuthService,
    private otpService: OtpServiceService,
    private router: Router
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
   * Inicia el proceso de registro
   */
  public startRegistration(registerForm: NgForm): void {
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

    // Verificar que el email no exista en el sistema
    this.userService.getUserByEmail(this.registerData.email).subscribe({
      next: (user) => {
        // Si encuentra un usuario, significa que el email ya existe
        if (user) {
          this.toastr.error('Este correo electrónico ya está registrado.', 'Error');
        }
      },
      error: (err) => {
        // Si es error 404, el email no existe y podemos continuar
        if (err.status === 404) {
          // Generar y enviar código OTP
          this.otpService.generateOtp(this.registerData.email).subscribe({
            next: (_code) => {
              console.log('✅ OTP generado y enviado al correo:', this.registerData.email);
              this.toastr.success('Código de verificación enviado a tu correo.', 'Éxito');

              // Abrir el modal de verificación
              this.verifModal.nativeElement.showModal();

              // Hacer foco en el primer input
              setTimeout(() => this.input1.nativeElement.focus(), 100);
            },
            error: (err) => {
              console.error('❌ Error al generar OTP:', err);
              this.toastr.error('Error al enviar el código de verificación.', 'Error');
            }
          });
        } else {
          // Otro tipo de error
          this.toastr.error('Error al verificar el correo electrónico.', 'Error');
        }
      }
    });
  }

  /**
   * Completa el registro después de validar el código OTP
   */
  public completeRegistration(): void {
    // Crear el objeto usuario
    const newUser: User = {
      name: this.registerData.name,
      email: this.registerData.email,
      password: this.registerData.password
    };

    // Crear el usuario en el backend
    this.userService.createUser(newUser).subscribe({
      next: (createdUser) => {
        console.log('✅ Usuario creado:', createdUser);
        this.toastr.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'Éxito');

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error al crear usuario:', err);
        this.toastr.error('Error al crear la cuenta. Intenta de nuevo.', 'Error');
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
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.verificationCode[position - 1] = '';
      return;
    }

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
   * Valida el código OTP
   */
  public verifyCode(): void {
    if (!this.isCodeComplete()) {
      this.toastr.warning('Por favor, completa todos los dígitos.', 'Código incompleto');
      return;
    }

    const code = this.verificationCode.join('');
    console.log('🔍 Validando código:', code);

    this.otpService.validateOtp(this.registerData.email, code).subscribe({
      next: (isValid) => {
        if (isValid) {
          console.log('✅ OTP válido - Creando usuario');
          this.toastr.success('Código verificado correctamente.', 'Éxito');

          // Cerrar el modal
          this.closeModal();

          // Completar el registro
          this.completeRegistration();

        } else {
          console.log('❌ OTP inválido');
          this.toastr.error('El código ingresado es incorrecto.', 'Error');

          // Limpiar inputs
          this.verificationCode = ['', '', '', '', '', ''];
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

  // =================================================================
  // Google OAuth Register
  // =================================================================

  /**
   * Inicia el flujo de registro con Google
   */
  async registerWithGoogle(): Promise<void> {
    const result = await this.authService.loginWithGoogle();

    if (result) {
      console.log('Usuario autenticado con Google:', result);
      this.toastr.success('¡Bienvenido con Google!', 'Éxito');

      // Redirigir al dashboard
      setTimeout(() => {
        this.router.navigate(['/main']);
      }, 2000);
    } else {
      this.toastr.error('Error al registrarse con Google', 'Error');
    }
  }

  /**
   * Inicia el flujo de registro con Microsoft
   */
  async registerWithMicrosoft(): Promise<void> {
    try {
      // Llamar al servicio de autenticación con Microsoft
      const result = await this.authService.loginWithMicrosoft();

      if (result) {
        // ✅ Autenticación exitosa
        console.log('✅ Usuario autenticado con Microsoft:', result);
        this.toastr.success('¡Bienvenido con Microsoft!', 'Registro exitoso');

        // Redirigir al dashboard
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2000);
      } else {
        // ❌ Error en autenticación
        this.toastr.error('Error al registrarse con Microsoft', 'Error');
      }
    } catch (error) {
      console.error('❌ Error en registro con Microsoft:', error);
      this.toastr.error('No se pudo registrar con Microsoft. Intenta de nuevo.', 'Error');
    }
  }
}
