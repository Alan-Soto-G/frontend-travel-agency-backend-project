import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Fee } from 'src/app/models/business-models/fee.model';
import { FeeService } from 'src/app/services/models/business-models/fee.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * FeesComponent
 *
 * Componente de página para la gestión de tarifas/cuotas (Fees).
 * Muestra una tabla CRUD reutilizable para las tarifas y define los campos y funciones específicas.
 * Utiliza el servicio FeeService para operaciones CRUD.
 */
@Component({
  selector: 'app-fees',
  imports: [TableCrudComponent],
  templateUrl: './fees.component.html',
})
export class FeesComponent implements OnInit {
  /**
   * Lista de tarifas cargadas desde el backend.
   */
  fees: Fee[] = [];

  /**
   * Encabezados de la tabla.
   */
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

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'tripId',       // ✅ Cambiado de trip_id a tripId (camelCase)
    'amount',
    'description',
    'dueDate',      // ✅ Cambiado de due_date a dueDate (camelCase)
    'status',
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
      name: 'tripId',    // ✅ Cambiado a camelCase
      label: 'ID del Viaje', 
      type: 'number', 
      placeholder: 'Ingrese el ID del viaje',
      required: true 
    },
    { 
      name: 'amount', 
      label: 'Monto', 
      type: 'number', 
      placeholder: 'Ingrese el monto',
      required: true,
      min: 0,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Detalle de la tarifa (opcional)',
      required: false,  // ✅ Opcional según el modelo
      max: 500,
    },
    { 
      name: 'dueDate',   // ✅ Cambiado a camelCase
      label: 'Fecha Límite de Pago', 
      type: 'date', 
      placeholder: 'Seleccione la fecha límite',
      required: true 
    },
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

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param feeService Servicio para gestionar las tarifas
   */
  constructor(private feeService: FeeService) {
    this.arrayFunctions = {
      update: (id?: string, fee?: Fee) => this.update(id, fee),
      create: (fee?: Fee) => this.create(fee),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de las tarifas al montar el componente.
   */
  ngOnInit(): void {
    this.loadFees();
  }

  /**
   * Carga la lista de tarifas desde el backend.
   */
  loadFees(): void {
    this.feeService.getFees().subscribe({
      next: (res: any) => {
        this.fees = res.data;  // ✅ Extraer solo el array de data
        console.log('Tarifas cargadas:', this.fees);
      },
      error: (err) => console.error('Error al cargar tarifas', err),
    });
  }

  /**
   * Busca una tarifa por ID.
   * @param id ID de la tarifa
   */
  findById(id: string): void {
    this.feeService.getFeeById(id).subscribe({
      next: (data) => console.log('Tarifa encontrada:', data),
      error: (err) => console.error('Error al buscar tarifa', err),
    });
  }

  /**
   * Actualiza una tarifa.
   * @param id ID de la tarifa
   * @param fee Datos actualizados
   */
  update(id?: string, fee?: Fee): void {
    if (id && fee) {
      this.feeService.updateFee(id, fee).subscribe({
        next: () => this.loadFees(),
        error: (err) => console.error('Error al actualizar tarifa', err),
      });
    }
  }

  /**
   * Crea una nueva tarifa.
   * @param fee Datos de la nueva tarifa
   */
  create(fee?: Fee): void {
    if (fee) {
      this.feeService.createFee(fee).subscribe({
        next: () => this.loadFees(),
        error: (err) => console.error('Error al crear tarifa', err),
      });
    }
  }

  /**
   * Elimina una tarifa.
   * @param id ID de la tarifa a eliminar
   */
  delete(id: string): void {
    this.feeService.deleteFee(id).subscribe({
      next: () => this.loadFees(),
      error: (err) => console.error('Error al eliminar tarifa', err),
    });
  }
}