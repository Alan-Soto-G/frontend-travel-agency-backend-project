import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth, 
    private toastr: ToastrService, 
    private http: HttpClient
  ) {}

  // ✅ Login con Google
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return this.loginAndSendToBackend(provider, 'Google');
  }

  // ✅ Login con GitHub
  async loginWithGithub() {
    const provider = new GithubAuthProvider();
    return this.loginAndSendToBackend(provider, 'GitHub');
  }

  // ✅ Login con Microsoft
  async loginWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');
    return this.loginAndSendToBackend(provider, 'Microsoft');
  }

  // 🔐 Método privado unificado para todos los providers
  private async loginAndSendToBackend(provider: any, providerName: string) {
    try {
      // 1. Autenticación con Firebase
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      // 2. Obtener el token de Firebase
      const idToken = await user.getIdToken();

      console.log('Usuario autenticado:', user);

      // 3. Enviar token al backend para validación
      const backendUrl = `${environment.apiUrl}public/auth`;
      
      const backendResponse = await firstValueFrom(
        this.http.post<any>(backendUrl, { idToken }).pipe(
          tap((response) => {
            // 4. 🔑 GUARDAR EL JWT DEL BACKEND
            if (response.jwt) {
              sessionStorage.setItem('token', response.jwt);
              console.log('✅ JWT guardado correctamente');
            } else {
              console.error('❌ No se encontró el JWT en la respuesta');
            }
          })
        )
      );

      this.toastr.success(`¡Bienvenido, ${user.displayName || 'Usuario'}!`, `Inicio de sesión con ${providerName}`);

      return { 
        user: backendResponse.user,
        token: backendResponse.jwt
      };

    } catch (error: any) {
      console.error(`Error en autenticación con ${providerName}:`, error);
      
      // Mensajes de error específicos
      if (error.status === 401) {
        this.toastr.error('Token de Google inválido o vencido', 'Error de autenticación');
      } else if (error.code === 'auth/popup-closed-by-user') {
        this.toastr.warning('Cancelaste el inicio de sesión', 'Aviso');
      } else if (error.code === 'auth/network-request-failed') {
        this.toastr.error('Error de conexión. Verifica tu internet', 'Error');
      } else {
        this.toastr.error(`No se pudo iniciar sesión con ${providerName}`, 'Error');
      }
      
      return null;
    }
  }

  // 🚪 Logout
  async logout() {
    try {
      await this.auth.signOut();
      sessionStorage.removeItem('token');
      this.toastr.success('Sesión cerrada correctamente', 'Hasta pronto');
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.toastr.error('Error al cerrar sesión', 'Error');
      return false;
    }
  }

  // 🔍 Verificar si hay sesión activa
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  // 📝 Obtener el token actual
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
}