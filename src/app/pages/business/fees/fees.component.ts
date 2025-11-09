import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Fee } from 'src/app/models/business-models/fee.model';
import { FeeService } from 'src/app/services/models/business-models/fee.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

@Component({
  selector: 'app-fees',
  imports: [TableCrudComponent],
  templateUrl: './fees.component.html',
})
export class FeesComponent implements OnInit {
  fees: Fee[] = [];

  headTable: string[] = [
    'ID',
    'Viaje ID',
    'Monto',
    'Descripción',
    'Fecha Límite',
    'Estado',
    'Actualizar',
    'Eliminar',
  ];

  itemsData: string[] = [
    'id',
    'trip_id',
    'amount',
    'description',
    'due_date',
    'status',
  ];

  arrayFunctions: Record<string, Function>;

  fields: FormField[] = [
    { name: 'trip_id', label: 'ID del Viaje', type: 'number', required: true },
    { name: 'amount', label: 'Monto', type: 'number', required: true },
    {
      name: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Detalle de la tarifa',
      required: true,
      min: 3,
    },
    { name: 'due_date', label: 'Fecha de Pago', type: 'date', required: true },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'pending', text: 'Pendiente' },
        { value: 'paid', text: 'Pagado' },
        { value: 'overdue', text: 'Vencido' },
      ],
      required: true,
    },
  ];

  constructor(private feeService: FeeService) {
    this.arrayFunctions = {
      update: (id?: string, fee?: Fee) => this.update(id, fee),
      create: (fee?: Fee) => this.create(fee),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees(): void {
    this.feeService.getFees().subscribe({
      next: (data) => (this.fees = data),
      error: (err) => console.error('Error al cargar tarifas', err),
    });
  }

  findById(id: string): void {
    this.feeService.getFeeById(id).subscribe({
      next: (data) => console.log('Tarifa encontrada:', data),
      error: (err) => console.error('Error al buscar tarifa', err),
    });
  }

  update(id?: string, fee?: Fee): void {
    if (id && fee) {
      this.feeService.updateFee(id, fee).subscribe({
        next: () => this.loadFees(),
        error: (err) => console.error('Error al actualizar tarifa', err),
      });
    }
  }

  create(fee?: Fee): void {
    if (fee) {
      this.feeService.createFee(fee).subscribe({
        next: () => this.loadFees(),
        error: (err) => console.error('Error al crear tarifa', err),
      });
    }
  }

  delete(id: string): void {
    this.feeService.deleteFee(id).subscribe({
      next: () => this.loadFees(),
      error: (err) => console.error('Error al eliminar tarifa', err),
    });
  }
}
