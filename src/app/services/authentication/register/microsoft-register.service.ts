import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '../../notifications/notification.service';

/**
 * Servicio para registro con Microsoft OAuth
 *
 * Flujo de registro:
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
export class MicrosoftRegisterService {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  /**
   * Inicia el flujo de registro con Microsoft OAuth
   *
   * @returns Promise con el resultado del registro
   */
  async register(): Promise<boolean> {
    try {
      console.log('🔵 Iniciando registro con Microsoft...');
      // Llamar al servicio de autenticación con Microsoft
      const result = await this.authService.loginWithMicrosoft();
      if (result) {
        // ✅ Registro exitoso
        console.log('✅ Usuario registrado con Microsoft:', result);
        this.toastr.success('¡Bienvenido con Microsoft!', 'Registro exitoso');



        //this.notificationService.sendWelcomeEmail(email, name).subscribe();
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2000);
        return true;
      } else {
        // ❌ Error en registro
        this.toastr.error('No se pudo completar el registro', 'Error con Microsoft');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en registro con Microsoft:', error);
      this.toastr.error('No se pudo registrar con Microsoft. Intenta de nuevo.', 'Error');
      return false;
    }
  }
}
