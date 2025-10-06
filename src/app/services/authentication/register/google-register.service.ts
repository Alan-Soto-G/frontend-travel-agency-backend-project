import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
/**
 * Servicio para registro con Google OAuth
 *
 * Flujo de registro:
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
export class GoogleRegisterService {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}
  /**
   * Inicia el flujo de registro con Google OAuth
   *
   * @returns Promise con el resultado del registro
   */
  async register(): Promise<boolean> {
    try {
      console.log('🔵 Iniciando registro con Google...');
      // Llamar al servicio de autenticación con Google
      const result = await this.authService.loginWithGoogle();
      if (result) {
        // ✅ Registro exitoso
        console.log('✅ Usuario registrado con Google:', result);
        this.toastr.success('¡Bienvenido con Google!', 'Registro exitoso');
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2000);
        return true;
      } else {
        // ❌ Error en registro
        this.toastr.error('No se pudo completar el registro', 'Error con Google');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en registro con Google:', error);
      this.toastr.error('No se pudo registrar con Google. Intenta de nuevo.', 'Error');
      return false;
    }
  }
}
