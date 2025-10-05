
import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface Permission {
  url: string;
  method: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private securityUrl = `${environment.apiUrl}public/security/`;

  constructor(
    private auth: Auth,
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router
  ) {}

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN OAUTH
  // ========================================

  /**
   * Login con Google
   */
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return this.loginAndSendToBackend(provider, 'Google');
  }

  /**
   * Login con GitHub
   */
  async loginWithGithub() {
    const provider = new GithubAuthProvider();
    return this.loginAndSendToBackend(provider, 'GitHub');
  }

  /**
   * Login con Microsoft
   */
  async loginWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');
    return this.loginAndSendToBackend(provider, 'Microsoft');
  }

  /**
   * Método privado unificado para todos los providers
   */
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
            // 4. Guardar el JWT del backend
            if (response.jwt) {
              sessionStorage.setItem('token', response.jwt);
              console.log('✅ JWT guardado correctamente');
            } else {
              console.error('❌ No se encontró el JWT en la respuesta');
            }

            // 5. Guardar datos del usuario si vienen
            if (response.user) {
              sessionStorage.setItem('user', JSON.stringify(response.user));
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
        this.toastr.error('Token inválido o vencido', 'Error de autenticación');
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

  // ========================================
  // MÉTODOS DE VALIDACIÓN DE PERMISOS
  // ========================================

  /**
   * Valida si el usuario tiene permiso para acceder a una URL específica
   */
  validatePermission(url: string, method: string = 'GET'): Observable<boolean> {
    const permission: Permission = { url, method };

    return this.http.post<boolean>(
      this.securityUrl + 'permissions-validation',
      permission
    ).pipe(
      map(response => {
        console.log(`Permiso para ${url} [${method}]:`, response);
        return response;
      }),
      catchError(error => {
        console.error('Error al validar permiso:', error);
        return of(false);
      })
    );
  }

  // ========================================
  // MÉTODOS GENERALES
  // ========================================

  /**
   * Verifica si hay sesión activa
   */
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  /**
   * Obtiene el usuario del sessionStorage
   */
  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Cierra sesión
   */
  async logout() {
    try {
      await this.auth.signOut();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      this.toastr.success('Sesión cerrada correctamente', 'Hasta pronto');
      this.router.navigate(['/login']);
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.toastr.error('Error al cerrar sesión', 'Error');
      return false;
    }
  }
}
