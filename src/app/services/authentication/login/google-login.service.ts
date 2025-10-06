import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

/**
 * Servicio para autenticación con Google OAuth
 *
 * Flujo de autenticación:
 * 1. Abre popup de Google para autorización
 * 2. Usuario selecciona cuenta de Google
 * 3. Google devuelve token de autenticación
 * 4. Se crea/actualiza usuario en el backend
 * 5. Se guarda sesión y se redirige al dashboard
 *
 * @author Alan Soto
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleLoginService {

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Inicia el flujo de autenticación con Google OAuth
   *
   * @returns Promise con el resultado de la autenticación
   */
  async login(): Promise<boolean> {
    try {
      console.log('🔵 Iniciando login con Google...');

      // Llamar al servicio de autenticación con Google
      const result = await this.authService.loginWithGoogle();

      if (result) {
        // ✅ Autenticación exitosa
        console.log('✅ Usuario autenticado con Google:', result);
        this.toastr.success('¡Bienvenido!', 'Login con Google exitoso');

        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2000);

        return true;
      } else {
        // ❌ Error en autenticación
        this.toastr.error('No se pudo completar la autenticación', 'Error con Google');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      this.toastr.error('No se pudo iniciar sesión con Google. Intenta de nuevo.', 'Error');
      return false;
    }
  }
}

