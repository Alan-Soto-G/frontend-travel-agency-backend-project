import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * Servicio para autenticación con GitHub OAuth
 *
 * Flujo de autenticación:
 * 1. Abre popup de GitHub para autorización
 * 2. Usuario autoriza la aplicación
 * 3. GitHub devuelve token de autenticación
 * 4. Se crea/actualiza usuario en el backend
 * 5. Se guarda sesión y se redirige al dashboard
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class GithubLoginService {

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Inicia el flujo de autenticación con GitHub OAuth
   *
   * @returns Promise con el resultado de la autenticación
   */
  async login(): Promise<boolean> {
    try {
      console.log('🐙 Iniciando login con GitHub...');

      // Llamar al servicio de autenticación con GitHub
      const result = await this.authService.loginWithGithub();

      if (result) {
        // ✅ Autenticación exitosa
        console.log('✅ Usuario autenticado con GitHub:', result);
        this.toastr.success('¡Bienvenido!', 'Login con GitHub exitoso');

        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2000);

        return true;
      } else {
        // ❌ Error en autenticación
        this.toastr.error('No se pudo completar la autenticación', 'Error con GitHub');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en login con GitHub:', error);
      this.toastr.error('No se pudo iniciar sesión con GitHub. Intenta de nuevo.', 'Error');
      return false;
    }
  }
}
