// angular import
import { Component, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RecapchaComponent } from 'src/app/components/recapcha/recapcha.component';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [RouterModule, RecapchaComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(private ngZone: NgZone, private authService: AuthService, private toastr: ToastrService,){}

  captchaToken: string | null = null;

onCaptchaResolved(token: string) {
  this.ngZone.run(() => {
    console.log('Captcha resuelto:', token);
    this.captchaToken = token;
  });
}

async loginWithGoogle() {
  const result = await this.authService.loginWithGoogle();

  if (result) {
    console.log('Usuario autenticado:', result);
    this.toastr.success('¡Bienvenido con Google!');
    // Aquí luego podrás redirigir o guardar datos
  } else {
    this.toastr.error('Error al iniciar con Google');
  }
}

}
