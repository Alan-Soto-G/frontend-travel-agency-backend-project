import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Invoice } from 'src/app/models/business-models/invoice.model';
import { InvoiceService } from 'src/app/services/models/business-models/invoice.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * InvoicesComponent
 *
 * Componente de página para la gestión de facturas (Invoices).
 * Muestra una tabla CRUD reutilizable para las facturas y define los campos y funciones específicas.
 * Utiliza el servicio InvoiceService para operaciones CRUD.
 */
@Component({
  selector: 'app-invoices',
  imports: [TableCrudComponent],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent implements OnInit {
  /**
   * Lista de facturas cargadas desde el backend.
   */
  invoices: Invoice[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Tarifa ID',
    'Número de Factura',
    'Monto Total',
    'Fecha Emisión',
    'Fecha Pago',
    'Método Pago',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'feeId',           // ✅ Cambiado de fee_id a feeId (camelCase)
    'invoiceNumber',   // ✅ Cambiado de invoice_number a invoiceNumber
    'totalAmount',     // ✅ Cambiado de total_amount a totalAmount
    'issueDate',       // ✅ Cambiado de issue_date a issueDate
    'paymentDate',     // ✅ Cambiado de payment_date a paymentDate
    'paymentMethod',   // ✅ Cambiado de payment_method a paymentMethod
  ];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [
    { 
      name: 'feeId',           // ✅ Cambiado a camelCase
      label: 'ID de la Tarifa', 
      type: 'number', 
      placeholder: 'Ingrese el ID de la tarifa',
      required: true 
    },
    {
      name: 'invoiceNumber',   // ✅ Cambiado a camelCase
      label: 'Número de Factura',
      type: 'text',
      placeholder: 'Ingrese el número de factura',
      required: true,
      min: 3,
      max: 255,
    },
    { 
      name: 'totalAmount',     // ✅ Cambiado a camelCase
      label: 'Monto Total', 
      type: 'number', 
      placeholder: 'Ingrese el monto total',
      required: true 
    },
    { 
      name: 'issueDate',       // ✅ Cambiado a camelCase
      label: 'Fecha de Emisión', 
      type: 'date', 
      placeholder: 'Seleccione la fecha de emisión',
      required: true 
    },
    { 
      name: 'paymentDate',     // ✅ Cambiado a camelCase
      label: 'Fecha de Pago', 
      type: 'date', 
      placeholder: 'Seleccione la fecha de pago (opcional)',
      required: false          // ✅ Cambiado a false porque puede ser null
    },
    {
      name: 'paymentMethod',   // ✅ Cambiado a camelCase
      label: 'Método de Pago',
      type: 'select',
      options: [
        { value: 'cash', text: 'Efectivo' },
        { value: 'credit_card', text: 'Tarjeta de Crédito' },
        { value: 'debit_card', text: 'Tarjeta Débito' },
        { value: 'bank_transfer', text: 'Transferencia Bancaria' },
        { value: 'paypal', text: 'PayPal' },
        { value: 'other', text: 'Otro' },
      ],
      required: true,
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param invoiceService Servicio para gestionar las facturas
   */
  constructor(private invoiceService: InvoiceService) {
    this.arrayFunctions = {
      update: (id?: string, invoice?: Invoice) => this.update(id, invoice),
      create: (invoice?: Invoice) => this.create(invoice),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de las facturas al montar el componente.
   */
  ngOnInit(): void {
    this.loadInvoices();
  }

  /**
   * Carga la lista de facturas desde el backend.
   */
  loadInvoices(): void {
    this.invoiceService.getInvoices().subscribe({
      next: (res: any) => {
        this.invoices = res.data;  // ✅ Extraer solo el array de data
        console.log('Facturas cargadas:', this.invoices);
      },
      error: (err) => console.error('Error al cargar facturas', err),
    });
  }

  /**
   * Busca una factura por ID.
   * @param id ID de la factura
   */
  findById(id: string): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (data) => console.log('Factura encontrada:', data),
      error: (err) => console.error('Error al buscar factura', err),
    });
  }

  /**
   * Actualiza una factura.
   * @param id ID de la factura
   * @param invoice Datos actualizados
   */
  update(id?: string, invoice?: Invoice): void {
    if (id && invoice) {
      this.invoiceService.updateInvoice(id, invoice).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error al actualizar factura', err),
      });
    }
  }

  /**
   * Crea una nueva factura.
   * @param invoice Datos de la nueva factura
   */
  create(invoice?: Invoice): void {
    if (invoice) {
      this.invoiceService.createInvoice(invoice).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error al crear factura', err),
      });
    }
  }

  /**
   * Elimina una factura.
   * @param id ID de la factura a eliminar
   */
  delete(id: string): void {
    this.invoiceService.deleteInvoice(id).subscribe({
      next: () => this.loadInvoices(),
      error: (err) => console.error('Error al eliminar factura', err),
    });
  }
}