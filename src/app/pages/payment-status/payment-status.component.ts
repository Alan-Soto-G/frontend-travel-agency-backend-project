// src/app/components/payment-status/payment-status.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss']
})
export class PaymentStatusComponent implements OnInit {
  loading: boolean = true;
  success: boolean = false;
  error: string = '';
  
  // Datos del pago
  refPayco: string = '';
  transactionId: string = '';
  tripClientId: number = 0;
  installments: number = 1; // ✅ Compatible con el HTML
  totalAmount: number = 0; // ✅ Compatible con el HTML
  currentInstallment: number = 1; // Número de cuota actual (para uso interno)
  
  // Estado de creación de cuotas y facturas
  feesCreated: boolean = false;
  invoicesCreated: boolean = false;
  pollingAttempts: number = 0;
  maxPollingAttempts: number = 10; // Máximo 20 segundos (10 intentos x 2 segundos)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // ✅ Obtener parámetros de la URL que ePayco envía
    this.route.queryParams.subscribe(params => {
      console.log('📥 Parámetros de ePayco:', params);

      this.refPayco = params['ref_payco'] || params['x_ref_payco'];
      this.transactionId = params['x_transaction_id'];
      const transactionState = params['x_transaction_state'];

      // ✅ x_extra2 = total de cuotas (para mostrar en el HTML)
      this.installments = parseInt(params['x_extra2'] || '1');
      
      // ✅ x_extra3 = número de cuota actual (para lógica interna)
      this.currentInstallment = parseInt(params['x_extra3'] || '1');
      
      // ✅ x_amount = monto de la cuota pagada
      this.totalAmount = parseFloat(params['x_amount'] || '0');

      console.log('💳 Referencia:', this.refPayco);
      console.log('🔢 Total de cuotas:', this.installments);
      console.log('📍 Cuota actual:', this.currentInstallment);
      console.log('💰 Monto pagado:', this.totalAmount);

      // ✅ Verificar si el pago fue exitoso
      if (transactionState === 'Aceptada') {
        this.success = true;
        this.checkPaymentStatus();
      } else {
        this.success = false;
        this.error = params['x_response_reason_text'] || 'Pago rechazado';
        this.loading = false;
      }
    });
  }

  /**
   * ✅ Verificar el estado del pago (el backend ya creó las cuotas y facturas)
   */
  private async checkPaymentStatus(): Promise<void> {
    try {
      console.log('🔍 Verificando pago en backend...');

      const response = await fetch(
        `https://necole-wholistic-javier.ngrok-free.dev/api/payment/status?ref_payco=${this.refPayco}`
      );

      const data = await response.json();
      console.log('📊 Respuesta del backend:', data);

      if (!data.success) {
        throw new Error('Pago no encontrado en el backend');
      }

      this.tripClientId = data.data.tripClient.id;

      // ✅ Verificar si el backend ya creó las cuotas
      const feesCreated = data.data.feesCreated && data.data.feesCount > 0;
      
      // ✅ Verificar si el backend ya creó las facturas
      const invoicesCreated = data.data.invoicesCreated && data.data.invoicesCount > 0;

      if (feesCreated && invoicesCreated) {
        console.log(`✅ ${data.data.feesCount} cuotas creadas por el backend`);
        console.log(`✅ ${data.data.invoicesCount} facturas creadas por el backend`);
        
        this.feesCreated = true;
        this.invoicesCreated = true;
        this.loading = false;
        
        // Limpiar carrito
        this.cartService.clearCart();
        return;
      }

      // ⏳ Si aún no se crearon, esperar y reintentar (el webhook puede tardar unos segundos)
      this.pollingAttempts++;
      
      if (this.pollingAttempts < this.maxPollingAttempts) {
        console.log(`⏳ Esperando a que el backend procese el pago... (intento ${this.pollingAttempts}/${this.maxPollingAttempts})`);
        console.log(`   - Cuotas creadas: ${feesCreated ? 'Sí' : 'No'}`);
        console.log(`   - Facturas creadas: ${invoicesCreated ? 'Sí' : 'No'}`);
        
        setTimeout(() => this.checkPaymentStatus(), 2000); // Reintentar cada 2 segundos
      } else {
        // Si después de 20 segundos no se crearon, mostrar error
        console.warn('⚠️ Las cuotas/facturas no se crearon en el tiempo esperado');
        this.error = 'El pago fue procesado pero hubo un problema. Por favor contacta con soporte.';
        this.loading = false;
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      this.error = error.message || 'Error al procesar el pago';
      this.loading = false;
    }
  }

  /**
   * Volver al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/default']);
  }

  /**
   * Ver mis reservas
   */
  viewMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

  /**
   * Ver mis cuotas
   */
  viewMyInstallments(): void {
    this.router.navigate(['/fees']);
  }

  /**
   * Obtener mensaje de éxito personalizado
   */
  getSuccessMessage(): string {
    if (this.currentInstallment === 1 && this.installments === 1) {
      return '¡Pago completado exitosamente!';
    } else if (this.currentInstallment === this.installments) {
      return `¡Cuota final (${this.currentInstallment}/${this.installments}) pagada! Pago completado.`;
    } else {
      return `¡Cuota ${this.currentInstallment}/${this.installments} pagada exitosamente!`;
    }
  }
}