import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Invoice } from 'src/app/models/business-models/invoice.model';
import { InvoiceService } from 'src/app/services/models/business-models/invoice.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

@Component({
  selector: 'app-invoices',
  imports: [TableCrudComponent],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];

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

  itemsData: string[] = [
    'id',
    'fee_id',
    'invoice_number',
    'total_amount',
    'issue_date',
    'payment_date',
    'payment_method',
  ];

  arrayFunctions: Record<string, Function>;

  fields: FormField[] = [
    { name: 'fee_id', label: 'ID de la Tarifa', type: 'number', required: true },
    {
      name: 'invoice_number',
      label: 'Número de Factura',
      type: 'text',
      required: true,
    },
    { name: 'total_amount', label: 'Monto Total', type: 'number', required: true },
    { name: 'issue_date', label: 'Fecha de Emisión', type: 'date', required: true },
    { name: 'payment_date', label: 'Fecha de Pago', type: 'date', required: true },
    {
      name: 'payment_method',
      label: 'Método de Pago',
      type: 'select',
      options: [
        { value: 'credit_card', text: 'Tarjeta de Crédito' },
        { value: 'debit_card', text: 'Tarjeta Débito' },
        { value: 'cash', text: 'Efectivo' },
        { value: 'transfer', text: 'Transferencia' },
      ],
      required: true,
    },
  ];

  constructor(private invoiceService: InvoiceService) {
    this.arrayFunctions = {
      update: (id?: string, invoice?: Invoice) => this.update(id, invoice),
      create: (invoice?: Invoice) => this.create(invoice),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoiceService.getInvoices().subscribe({
      next: (data) => (this.invoices = data),
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
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error al actualizar factura', err),
      });
    }
  }

  create(invoice?: Invoice): void {
    if (invoice) {
      this.invoiceService.createInvoice(invoice).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => console.error('Error al crear factura', err),
      });
    }
  }

  delete(id: string): void {
    this.invoiceService.deleteInvoice(id).subscribe({
      next: () => this.loadInvoices(),
      error: (err) => console.error('Error al eliminar factura', err),
    });
  }
}
