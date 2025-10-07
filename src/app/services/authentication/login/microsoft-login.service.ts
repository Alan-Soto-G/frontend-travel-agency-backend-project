import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * Servicio para autenticación con Microsoft OAuth
 *
 * Flujo de autenticación:
 * 1. Abre popup de Microsoft para autorización
 * 2. Usuario selecciona cuenta de Microsoft
 * 3. Microsoft devuelve token de autenticación
 * 4. Se crea/actualiza usuario en el backend
 * 5. Se guarda sesión y se redirige al dashboard
 * @version 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class MicrosoftLoginService {

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Inicia el flujo de autenticación con Microsoft OAuth
   *
   * @returns Promise con el resultado de la autenticación
   */
  async login(): Promise<boolean> {
    try {
      console.log('🔷 Iniciando login con Microsoft...');

      // Llamar al servicio de autenticación con Microsoft
      const result = await this.authService.loginWithMicrosoft();

      if (result) {
        // ✅ Autenticación exitosa
        console.log('✅ Usuario autenticado con Microsoft:', result);
        this.toastr.success('¡Bienvenido!', 'Login con Microsoft exitoso');

        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2000);

        return true;
      } else {
        // ❌ Error en autenticación
        this.toastr.error('No se pudo completar la autenticación', 'Error con Microsoft');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en login con Microsoft:', error);
      this.toastr.error('No se pudo iniciar sesión con Microsoft. Intenta de nuevo.', 'Error');
      return false;
    }
  }
}
