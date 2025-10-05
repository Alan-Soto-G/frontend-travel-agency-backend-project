import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private toastr: ToastrService, private http: HttpClient) {}

  // ✅ Login con Google
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return this.loginAndSendToBackend(provider);
  }

  // ✅ Login con GitHub
  async loginWithGithub() {
    const provider = new GithubAuthProvider();
    return this.loginAndSendToBackend(provider);
  }

  // ✅ Login con Microsoft
  async loginWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');

    // Configurar scopes específicos para Microsoft
    provider.addScope('email');
    provider.addScope('profile');
    provider.addScope('openid');

    // Configurar parámetros adicionales si es necesario
    provider.setCustomParameters({
      'tenant': 'common', // Permite cuentas personales y de trabajo
      'prompt': 'select_account'
    });

    return this.loginAndSendToBackend(provider);
  }


  private async loginAndSendToBackend(provider: any) {
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken(); // 🔑 Token seguro de Firebase

      this.toastr.success(`Bienvenido, ${user.displayName || 'Usuario'}!`, 'Inicio de sesión exitoso');
      console.log('Usuario autenticado:', user);
      console.log('ID Token:', idToken);

      // 🚀 Enviar token al backend para validación (AJUSTA la URL)
      const backendUrl = environment.apiUrl + 'auth/google';
      const response = await firstValueFrom(this.http.post(backendUrl, { idToken }));

      console.log('Respuesta del backend:', response);
      return { user, backendResponse: response };

    } catch (error) {
      console.error('Error en autenticación:', error);
      this.toastr.error('No se pudo iniciar sesión', 'Error');
      return null;
    }
  }
}
