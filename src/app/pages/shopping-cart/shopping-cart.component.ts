// shopping-cart.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Trip } from 'src/app/models/business-models/trip.model';
import { TripService } from 'src/app/services/models/business-models/trip.service';
import { TripClientService } from 'src/app/services/models/business-models/trip-client.service';
import { FeeService } from 'src/app/services/models/business-models/fee.service';
import { EpaycoService, PaymentData } from 'src/app/services/epayco/epayco';
import { CartService, CartItem } from 'src/app/services/cart/cart.service';
import { environment } from 'src/environments/environment';
import { forkJoin } from 'rxjs';


interface FeeOption {
  installments: number;
  label: string;
  feeAmount: number;
  interest: number;
}

interface TripInstallmentSelection {
  [tripClientId: number]: number;
}

interface TripFeesInfo {
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  fees: any[];
}

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  cartItems: CartItem[] = [];
  trips: Trip[] = [];
  loading: boolean = true;

  tripInstallments: TripInstallmentSelection = {};
  tripFeesInfo: { [tripClientId: number]: TripFeesInfo } = {};
  feeOptions: FeeOption[] = [];
  openDropdownId: number | null = null;

  constructor(
    private tripService: TripService,
    private epaycoService: EpaycoService,
    private cartService: CartService,
    private tripClientService: TripClientService,
    private feeService: FeeService,
  ) {}

  ngOnInit(): void {
    this.loadCartFromBackend();
  }

 private loadCartFromBackend(): void {
  this.loading = true;

  this.tripClientService.getMyOrders().subscribe({
    next: (response) => {
      console.log('📦 Órdenes del backend:', response);

      if (response.data && Array.isArray(response.data)) {
        this.cartItems = response.data.map((order: any) => {
          const fees = order.fees || [];
          const paidFees = fees.filter((f: any) => f.status === 'paid').length;
          const totalFees = fees.length;
          
          return {
            id: order.id,
            trip: order.trip,
            quantity: order.quantity || 1,
            travelers: order.travelers,
            paymentStatus: order.paymentStatus || order.payment_status || 'pending',
            paidInstallments: paidFees,
            totalInstallments: totalFees > 0 ? totalFees : (order.installments || 1)
          };
        });

        console.log('✅ CartItems procesados:', this.cartItems.map(i => ({ 
          id: i.id, 
          tripName: i.trip.name,
          paymentStatus: i.paymentStatus,
          installments: `${i.paidInstallments}/${i.totalInstallments}`
        })));

        this.cartService.clearCart();
        this.loadFeesForAllTrips();
      }

      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Error al cargar órdenes:', err);
      
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
        this.calculateFeeOptions();
      });
      
      this.loading = false;
    }
  });
}

private loadFeesForAllTrips(): void {
  this.cartItems.forEach(item => {
    if (item.id && item.totalInstallments > 0) {
      this.tripFeesInfo[item.id] = {
        totalInstallments: item.totalInstallments,
        paidInstallments: item.paidInstallments,
        installmentAmount: 0,
        fees: []
      };

      this.tripInstallments[item.id] = item.totalInstallments;

      console.log(`✅ Info de cuotas para TripClient ${item.id}:`, {
        total: item.totalInstallments,
        paid: item.paidInstallments,
        remaining: item.totalInstallments - item.paidInstallments
      });
    }
  });

  const feeRequests = this.cartItems
    .filter(item => item.id && item.totalInstallments > 0)
    .map(item => this.feeService.getInstallmentsByTripClient(item.id!));

  if (feeRequests.length === 0) {
    this.initializeDefaultInstallments();
    this.calculateFeeOptions();
    return;
  }

  forkJoin(feeRequests).subscribe({
    next: (results) => {
      results.forEach((fees: any[], index) => {
        const item = this.cartItems.filter(i => i.id && i.totalInstallments > 0)[index];
        if (item.id && fees && fees.length > 0) {
          const firstFee = fees[0];

          this.tripFeesInfo[item.id].installmentAmount = 
            firstFee.amount || firstFee.installment_amount || 0;
          this.tripFeesInfo[item.id].fees = fees;

          console.log(`💰 Monto de cuota para TripClient ${item.id}: ${this.tripFeesInfo[item.id].installmentAmount}`);
        }
      });

      this.calculateFeeOptions();
    },
    error: (err) => {
      console.error('❌ Error al cargar montos de fees:', err);
      this.calculateFeeOptions();
    }
  });

  this.initializeDefaultInstallments();
}

private initializeDefaultInstallments(): void {
  this.cartItems.forEach(item => {
    if (item.id && !this.tripInstallments[item.id]) {
      this.tripInstallments[item.id] = item.totalInstallments || 1;
    }
  });
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.openDropdownId = null;
    }
  }

  toggleDropdown(tripClientId: number): void {
    if (this.openDropdownId === tripClientId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = tripClientId;
    }
  }

  isDropdownOpen(tripClientId: number): boolean {
    return this.openDropdownId === tripClientId;
  }

  selectInstallment(tripClientId: number, installments: number): void {
    this.tripInstallments[tripClientId] = installments;
    this.openDropdownId = null;
  }

  getSelectedInstallments(tripClientId: number): number {
    return this.tripInstallments[tripClientId] || 1;
  }

  calculateFeeOptions(): void {
    const total = this.total;
    
    const installmentPlans = [
      { installments: 1, interest: 0, label: 'Pago de contado' },
      { installments: 2, interest: 0, label: '2 cuotas sin interés' },
      { installments: 3, interest: 5, label: '3 cuotas' },
      { installments: 6, interest: 10, label: '6 cuotas' },
      { installments: 12, interest: 15, label: '12 cuotas' }
    ];

    this.feeOptions = installmentPlans.map(plan => {
      const totalWithInterest = total * (1 + plan.interest / 100);
      const feeAmount = totalWithInterest / plan.installments;
      
      return {
        installments: plan.installments,
        label: plan.label,
        feeAmount: feeAmount,
        interest: plan.interest
      };
    });
  }

  getSelectedFeeOption(tripClientId: number): FeeOption | undefined {
    const installments = this.getSelectedInstallments(tripClientId);
    return this.feeOptions.find(option => option.installments === installments);
  }

  updateQuantity(tripId: number, newQuantity: number): void {
    this.cartService.updateQuantity(tripId, newQuantity);
  }

  // ✅ NUEVO: Actualizar travelers con validación de cupos
  updateTravelers(tripClientId: number, newTravelers: number): void {
    if (newTravelers < 1) {
      alert('⚠️ Debe haber al menos 1 viajero.');
      return;
    }

    const item = this.cartItems.find(i => i.id === tripClientId);
    if (!item) return;

    const currentTravelers = item.travelers;
    const availableSeats = item.trip.availableSeats;
    
    // Calcular cupos realmente disponibles considerando los ya ocupados por esta reserva
    const seatsOccupiedByThisReservation = currentTravelers;
    const totalAvailableForThisReservation = availableSeats + seatsOccupiedByThisReservation;

    // Validar que no exceda los cupos totales disponibles
    if (newTravelers > totalAvailableForThisReservation) {
      alert(`⚠️ No hay suficientes cupos disponibles.\n\n` +
            `Cupos disponibles en el viaje: ${availableSeats}\n` +
            `Tu reserva actual: ${currentTravelers} viajero(s)\n` +
            `Máximo que puedes reservar: ${totalAvailableForThisReservation} viajero(s)\n` +
            `Solicitaste: ${newTravelers} viajero(s)`);
      return;
    }

    // Mostrar loading (opcional)
    console.log(`🔄 Actualizando de ${currentTravelers} a ${newTravelers} viajeros...`);

    // Actualizar en el backend
    this.tripClientService.updateTripClient(tripClientId, { travelers: newTravelers }).subscribe({
      next: (response) => {
        console.log('✅ Travelers actualizados en backend:', response);
        
        // Actualizar localmente el item
        const oldTravelers = item.travelers;
        item.travelers = newTravelers;
        
        // Actualizar los cupos disponibles del trip
        const seatsDifference = newTravelers - oldTravelers;
        item.trip.availableSeats -= seatsDifference;
        
        console.log(`📊 Cupos actualizados: ${item.trip.availableSeats} disponibles (${seatsDifference > 0 ? '-' : '+'}${Math.abs(seatsDifference)})`);
        
        // Recalcular opciones de cuotas ya que el total cambió
        this.calculateFeeOptions();
      },
      error: (err) => {
        console.error('❌ Error al actualizar travelers:', err);
        
        if (err.status === 400 && err.error?.message?.includes('seats')) {
          alert('⚠️ No hay suficientes cupos disponibles para esta cantidad de viajeros.\n\nPor favor, actualiza la página e intenta de nuevo.');
        } else if (err.status === 409) {
          alert('⚠️ Los cupos disponibles han cambiado. Por favor, actualiza la página e intenta de nuevo.');
        } else {
          alert('❌ No se pudo actualizar el número de viajeros.\n\nPor favor, verifica tu conexión e intenta de nuevo.');
        }
        
        // Recargar el carrito para obtener el estado real
        this.loadCartFromBackend();
      }
    });
  }

  removeItem(tripClientId: number): void {
    console.log('🗑️ Intentando eliminar TripClient ID:', tripClientId);
    
    const item = this.cartItems.find(i => i.id === tripClientId);
    if (item) {
      if (item.paymentStatus === 'partial' || item.paymentStatus === 'processing') {
        alert('⚠️ No se puede eliminar esta orden porque tiene pagos en proceso o parciales.\n\nSi deseas cancelar tu reserva, por favor contacta con soporte.');
        return;
      }
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar este viaje del carrito?')) {
      this.tripClientService.deleteTripClient(tripClientId).subscribe({
        next: (response) => {
          console.log('✅ Orden eliminada del backend:', response);
          delete this.tripInstallments[tripClientId];
          this.loadCartFromBackend();
        },
        error: (err) => {
          console.error('❌ Error al eliminar orden:', err);
          
          if (err.error?.error === 'PAYMENT_EXISTS') {
            alert('⚠️ No se puede eliminar esta orden porque ya tiene pagos realizados.\n\nSi deseas cancelar tu reserva, por favor contacta con soporte.');
          } else if (err.status === 404) {
            alert('Esta orden ya no existe.');
            this.loadCartFromBackend();
          } else {
            alert('No se pudo eliminar el viaje. Por favor, intenta de nuevo.');
          }
        }
      });
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => 
      sum + (item.trip.price * item.travelers), 0
    );
  }

  get tax(): number {
    return this.subtotal * 0.12;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get cartCount(): number {
    return this.cartItems.length;
  }

  getTripDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = diffDays - 1;
    return `${diffDays} días / ${nights} ${nights === 1 ? 'noche' : 'noches'}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  getImageUrl(destination: string): string {
    const imageMap: { [key: string]: string } = {
      'París': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=250&fit=crop',
      'Cancún': 'https://images.unsplash.com/photo-1569165003085-e8a1066f1cb8?w=400&h=250&fit=crop',
      'Machu Picchu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=250&fit=crop',
      'default': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop'
    };

    for (const key in imageMap) {
      if (destination.toLowerCase().includes(key.toLowerCase())) {
        return imageMap[key];
      }
    }
    
    return imageMap['default'];
  }

  getItemTotal(item: CartItem): number {
    const subtotal = item.trip.price * item.travelers;
    const tax = subtotal * 0.12;
    return subtotal + tax;
  }

  getItemInstallmentAmount(item: CartItem): number {
    if (!item.id) return this.getItemTotal(item);
    
    if (this.tripFeesInfo[item.id] && this.tripFeesInfo[item.id].installmentAmount > 0) {
      return this.tripFeesInfo[item.id].installmentAmount;
    }
    
    const option = this.getSelectedFeeOption(item.id);
    if (!option) return this.getItemTotal(item);
    
    const itemTotal = this.getItemTotal(item);
    const itemTotalWithInterest = itemTotal * (1 + option.interest / 100);
    return itemTotalWithInterest / option.installments;
  }

  getFeesDetails(item: CartItem): string {
    if (!item.id || !this.tripFeesInfo[item.id]) {
      const remaining = item.totalInstallments - item.paidInstallments;
      return `Pagadas: ${item.paidInstallments}/${item.totalInstallments} • Faltan: ${remaining} cuota(s)`;
    }
    
    const info = this.tripFeesInfo[item.id];
    const remaining = info.totalInstallments - info.paidInstallments;
    
    return `Pagadas: ${info.paidInstallments}/${info.totalInstallments} • Faltan: ${remaining} cuota(s)`;
  }

  hasFeesLoaded(item: CartItem): boolean {
    return item.totalInstallments > 0;
  }

  payIndividualTrip(item: CartItem): void {
    if (!item.id) return;
    
    const option = this.getSelectedFeeOption(item.id);
    if (!option) return;

    let installmentAmount: number;
    let installmentNumber: number = 1;

    if (this.tripFeesInfo[item.id] && this.tripFeesInfo[item.id].installmentAmount > 0) {
      installmentAmount = this.tripFeesInfo[item.id].installmentAmount;
      installmentNumber = this.tripFeesInfo[item.id].paidInstallments + 1;
      
      console.log(`💰 Usando monto de cuota existente: ${installmentAmount.toLocaleString('es-CO')}`);
    } else {
      const itemSubtotal = item.trip.price * item.travelers;
      const itemTax = itemSubtotal * 0.12;
      const itemTotal = itemSubtotal + itemTax;
      const itemTotalWithInterest = itemTotal * (1 + option.interest / 100);
      installmentAmount = itemTotalWithInterest / option.installments;
    }
    
    const installmentSubtotal = installmentAmount / 1.12;
    const installmentTax = installmentAmount - installmentSubtotal;

    const paymentData: PaymentData = {
      name: `Reserva: ${item.trip.name}`,
      description: this.getIndividualTripDescription(item, option),
      invoice: this.epaycoService.generateInvoiceNumber(),
      currency: 'cop',
      
      amount: installmentAmount.toFixed(2),
      tax_base: installmentSubtotal.toFixed(2),
      tax: installmentTax.toFixed(2),
      
      country: 'co',
      lang: 'es',
      
      confirmation: 'https://necole-wholistic-javier.ngrok-free.dev/api/payment/confirmation',
      response: 'http://localhost:4200/payment-status',
      
      external: 'false',
      
      extra1: item.id.toString(),
      extra2: option.installments.toString(),
      extra3: installmentNumber.toString(),
    };

    console.log(`\n💳 Pago para: ${item.trip.name}`);
    console.log(`   Viajeros: ${item.travelers}`);
    console.log(`   Cuota ${installmentNumber}/${option.installments}`);
    console.log(`   Monto de esta cuota: ${installmentAmount.toLocaleString('es-CO')}`);
    if (this.tripFeesInfo[item.id]) {
      console.log(`   📊 Info de fees: ${this.getFeesDetails(item)}`);
    }
    console.log(`   TripClient ID: ${item.id}`);
    
    this.epaycoService.openCheckout(paymentData);
  }

  private getIndividualTripDescription(item: CartItem, option: FeeOption): string {
    const installmentNumber = item.paidInstallments + 1;
    const installmentInfo = option.installments > 1 
      ? ` (Cuota ${installmentNumber}/${option.installments})` 
      : '';
    return `${item.trip.name} - ${item.travelers} viajero(s)${installmentInfo}`;
  }

  canRemoveItem(item: CartItem): boolean {
    return item.paymentStatus !== 'partial' && 
           item.paymentStatus !== 'processing' &&
           item.paymentStatus !== 'completed';
  }

  canPayTrip(item: CartItem): boolean {
    return item.paymentStatus !== 'completed' && 
           item.paymentStatus !== 'cancelled' &&
           item.paymentStatus !== 'refunded';
  }

  getPaymentButtonText(item: CartItem): string {
    if (item.paymentStatus === 'completed') {
      return 'Pago Completado';
    }
    
    if (item.paymentStatus === 'cancelled' || item.paymentStatus === 'refunded') {
      return 'No Disponible';
    }
    
    if (item.paymentStatus === 'partial' && item.paidInstallments && item.totalInstallments) {
      const nextInstallment = item.paidInstallments + 1;
      return `Pagar Cuota ${nextInstallment}/${item.totalInstallments}`;
    }
    
    if (item.paymentStatus === 'processing') {
      return 'Pago en Proceso...';
    }
    
    return 'Pagar Este Viaje';
  }

  getPaymentStatusBadge(item: CartItem): { text: string; class: string } {
    switch (item.paymentStatus) {
      case 'completed':
        return { text: 'Pago Completado', class: 'status-completed' };
      case 'partial':
        return { text: `Pagado ${item.paidInstallments}/${item.totalInstallments}`, class: 'status-partial' };
      case 'processing':
        return { text: 'Procesando Pago', class: 'status-processing' };
      case 'cancelled':
        return { text: 'Cancelado', class: 'status-cancelled' };
      case 'refunded':
        return { text: 'Reembolsado', class: 'status-refunded' };
      default:
        return { text: 'Pendiente de Pago', class: 'status-pending' };
    }
  }

  continuesShopping(): void {
    console.log('Continuar comprando...');
  }

  isExpired(endDate: string): boolean {
    return new Date(endDate) < new Date();
  }
}