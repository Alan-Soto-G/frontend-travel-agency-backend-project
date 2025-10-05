import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginModel } from '../../../models/login.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { RecapchaComponent } from 'src/app/components/recapcha/recapcha.component';
import { AuthService } from 'src/app/services/auth.service';

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

  public loginData: LoginModel = { email: '', password: '' };
  public verificationCode: string[] = ['', '', '', '', '', ''];

  @ViewChild('verifModal') private verifModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('input1') private input1!: ElementRef<HTMLInputElement>;
  @ViewChild('input2') private input2!: ElementRef<HTMLInputElement>;
  @ViewChild('input3') private input3!: ElementRef<HTMLInputElement>;
  @ViewChild('input4') private input4!: ElementRef<HTMLInputElement>;
  @ViewChild('input5') private input5!: ElementRef<HTMLInputElement>;
  @ViewChild('input6') private input6!: ElementRef<HTMLInputElement>;

  // =================================================================
  // Lifecycle & Constructor
  // =================================================================

  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private ngZone: NgZone,
    private authService: AuthService,
    private otpService: OtpServiceService,
    private cookieService: CookieService,
    private sessionService: SessionService,
    private router: Router,
    private securityService: SecurityService
  ) {}

  get isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 5;
  }

  // =================================================================
  // Login Form Logic
  // =================================================================

  public verificationInfo(loginForm: NgForm): void {
    if (!loginForm.valid) {
      this.toastr.error('Por favor rellena los campos de manera correcta.', 'Error');
      return;
    }

    this.userService.getUserByEmail(this.loginData.email).subscribe({
      next: () => {
        this.verifModal.nativeElement.showModal();
      },
      error: () => {
        this.toastr.error(`El correo ${this.loginData.email} no está asociado a ninguna cuenta.`, 'Error');
      }
    });
  }

  // =================================================================
  // 2FA Modal Logic
  // =================================================================

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

  public onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      const prevInput = this[`input${index}` as keyof this] as ElementRef;
      prevInput?.nativeElement.focus();
    }
  }

  public verifyCode(): void {

    if (!this.isCodeComplete()) {
      this.toastr.warning('Por favor, completa todos los dígitos.', 'Código incompleto');
      return;
    }


    const code = this.verificationCode.join('');
    console.log('Código ingresado:', code);

    // TODO: Implement 2FA verification logic with the backend
    // this.authService.verify2FA(code).subscribe(...)

    this.toastr.success('Código verificado correctamente.', 'Éxito');
    this.closeModal();
  }

  public closeModal(): void {
    this.verifModal.nativeElement.close();
  }

  private isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }



  captchaToken: string | null = null;

  onCaptchaResolved(token: string) {
    this.ngZone.run(() => {
      console.log('Captcha resuelto:', token);
      this.captchaToken = token;
    });
  }

async loginWithMicrosoft() {
  const result = await this.authService.loginWithMicrosoft();

  if (result) {
    console.log('Usuario autenticado:', result);
    this.toastr.success('¡Bienvenido con Microsoft!');
    this.router.navigate(['/default']);
  } else {
    this.toastr.error('Error al iniciar con Microsoft');
  }
}

}
