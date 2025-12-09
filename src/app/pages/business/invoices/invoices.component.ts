import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Invoice } from 'src/app/models/business-models/invoice.model';
import { InvoiceService } from 'src/app/services/models/business-models/invoice.service';
import { FeeService } from 'src/app/services/models/business-models/fee.service';
import { BankCardService } from 'src/app/services/models/business-models/bank-card.service';
import { TripService } from 'src/app/services/models/business-models/trip.service'; // 👈 Agregar esto
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invoices',
  imports: [TableCrudComponent],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  
  headTable: string[] = [
    'ID',
    'Tarifa',
    'Tarjeta Bancaria',
    'Número de Factura',
    'Monto Total',
    'Fecha Emisión',
    'Fecha Pago',
    'Método Pago',
    'Actualizar',
    'Eliminar',
  ];

  itemsData: string[] = [
    'id',
    'fee.id',
    'bankCard.cardNumber',
    'invoiceNumber',
    'totalAmount',
    'issueDate',
    'paymentDate',
    'paymentMethod',
  ];

  arrayFunctions: Record<string, Function>;
  fields: FormField[] = [];

  // Cache de datos
  private tripsCache: any[] = [];
  private bankCardsCache: any[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private feeService: FeeService,
    private bankCardService: BankCardService,
    private tripService: TripService // 👈 Agregar esto
  ) {
    this.arrayFunctions = {
      update: (id?: string, invoice?: Invoice) => this.update(id, invoice),
      create: (invoice?: Invoice) => this.create(invoice),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      invoices: this.invoiceService.getInvoices(),
      fees: this.feeService.getFees(),
      bankCards: this.bankCardService.getBankCards(),
      trips: this.tripService.getTrips() // 👈 Cargar trips también
    }).subscribe({
      next: (results: any) => {
        // Guardar en cache
        this.tripsCache = results.trips.data;
        this.bankCardsCache = results.bankCards.data;

        // Enriquecer las facturas con las relaciones faltantes
        this.invoices = results.invoices.data.map((invoice: any) => {
          // Si fee existe pero no tiene trip, buscarlo
          if (invoice.fee && !invoice.fee.trip) {
            const trip = this.tripsCache.find(t => t.id === invoice.fee.tripId);
            if (trip) {
              invoice.fee.trip = trip;
            }
          }

          // Si no tiene bankCard pero tiene bankCardId, buscarlo
          if (!invoice.bankCard && invoice.bankCardId) {
            const bankCard = this.bankCardsCache.find(c => c.id === invoice.bankCardId);
            if (bankCard) {
              invoice.bankCard = bankCard;
            }
          }

          return invoice;
        });

        console.log('Facturas cargadas:', this.invoices.length, 'registros');

        // Construir opciones para el select de tarifas
        const feeOptions = results.fees.data.map((fee: any) => {
          // Enriquecer fee con trip si no lo tiene
          if (!fee.trip && fee.tripId) {
            fee.trip = this.tripsCache.find(t => t.id === fee.tripId);
          }
          
          return {
            value: fee.id,
            label: `${fee.trip?.name || 'Viaje sin nombre'} - $${fee.amount} - ${fee.status === 'paid' ? '✅ Pagado' : fee.status === 'pending' ? '⏳ Pendiente' : '❌ Vencido'} (ID: ${fee.id})`
          };
        });

        // Construir opciones para el select de tarjetas bancarias
        const bankCardOptions = results.bankCards.data.map((card: any) => ({
          value: card.id,
          label: `💳 ${card.cardNumber} - ${card.cardType} - ${card.bankName || 'Banco no especificado'}`
        }));

        // Definir los campos del formulario con las opciones cargadas
        this.fields = [
          { 
            name: 'feeId',
            label: 'Tarifa', 
            type: 'select',
            placeholder: 'Seleccione una tarifa',
            required: true,
            options: feeOptions
          },
          { 
            name: 'bankCardId',
            label: 'Tarjeta Bancaria', 
            type: 'select',
            placeholder: 'Seleccione una tarjeta (opcional)',
            required: false,
            options: bankCardOptions
          },
          {
            name: 'invoiceNumber',
            label: 'Número de Factura',
            type: 'text',
            placeholder: 'Ingrese el número de factura (ej: INV-2025-001)',
            required: true,
            minLength: 3,
            maxLength: 255,
          },
          { 
            name: 'totalAmount',
            label: 'Monto Total', 
            type: 'number', 
            placeholder: 'Ingrese el monto total',
            required: true,
            min: 0
          },
          { 
            name: 'issueDate',
            label: 'Fecha de Emisión', 
            type: 'date', 
            placeholder: 'Seleccione la fecha de emisión',
            required: true 
          },
          { 
            name: 'paymentDate',
            label: 'Fecha de Pago', 
            type: 'date', 
            placeholder: 'Seleccione la fecha de pago (opcional)',
            required: false
          },
          {
            name: 'paymentMethod',
            label: 'Método de Pago',
            type: 'select',
            placeholder: 'Seleccione el método de pago',
            options: [
              { value: 'cash', label: '💵 Efectivo' },
              { value: 'credit_card', label: '💳 Tarjeta de Crédito' },
              { value: 'debit_card', label: '💳 Tarjeta Débito' },
              { value: 'bank_transfer', label: '🏦 Transferencia Bancaria' },
              { value: 'paypal', label: '🅿️ PayPal' },
              { value: 'other', label: '📝 Otro' },
            ],
            required: true,
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de facturas (con enriquecimiento de datos).
   */
  loadInvoices(): void {
    this.invoiceService.getInvoices().subscribe({
      next: (res: any) => {
        // Enriquecer las facturas con las relaciones del cache
        this.invoices = res.data.map((invoice: any) => {
          if (invoice.fee && !invoice.fee.trip && invoice.fee.tripId) {
            const trip = this.tripsCache.find(t => t.id === invoice.fee.tripId);
            if (trip) {
              invoice.fee.trip = trip;
            }
          }

          if (!invoice.bankCard && invoice.bankCardId) {
            const bankCard = this.bankCardsCache.find(c => c.id === invoice.bankCardId);
            if (bankCard) {
              invoice.bankCard = bankCard;
            }
          }

          return invoice;
        });
        
        console.log('Facturas actualizadas:', this.invoices.length, 'registros');
      },
      error: (err) => console.error('Error al cargar facturas', err),
    });
  }

  findById(id: string): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (data) => console.log('Factura encontrada:', data),
      error: (err) => console.error('Error al buscar factura', err),
    });
  }

  update(id?: string, invoice?: Invoice): void {
    if (id && invoice) {
      this.invoiceService.updateInvoice(id, invoice).subscribe({
        next: () => {
          console.log('Factura actualizada exitosamente');
          this.loadInvoices();
        },
        error: (err) => console.error('Error al actualizar factura', err),
      });
    }
  }

  create(invoice?: Invoice): void {
    if (invoice) {
      this.invoiceService.createInvoice(invoice).subscribe({
        next: () => {
          console.log('Factura creada exitosamente');
          this.loadInvoices();
        },
        error: (err) => console.error('Error al crear factura', err),
      });
    }
  }

  delete(id: string): void {
    this.invoiceService.deleteInvoice(id).subscribe({
      next: () => {
        console.log('Factura eliminada exitosamente');
        this.loadInvoices();
      },
      error: (err) => console.error('Error al eliminar factura', err),
    });
  }
}