import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Fee } from 'src/app/models/business-models/fee.model';
import { FeeService } from 'src/app/services/models/business-models/fee.service';
import { TripClientService } from 'src/app/services/models/business-models/trip-client.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

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
    'Reserva (Cliente - Viaje)',
    'N° Cuota',
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
    'tripClient.id',       // Por ahora solo muestra el ID del TripClient
    'installmentNumber',
    'amount',
    'description',
    'dueDate',
    'status',
  ];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   * Se inicializa vacío y se llena dinámicamente en ngOnInit.
   */
  fields: FormField[] = [];

  /**
   * Constructor: inicializa los servicios y las funciones CRUD.
   * @param feeService Servicio para gestionar las tarifas
   * @param tripClientService Servicio para obtener las reservas (TripClient)
   */
  constructor(
    private feeService: FeeService,
    private tripClientService: TripClientService
  ) {
    this.arrayFunctions = {
      update: (id?: string, fee?: Fee) => this.update(id, fee),
      create: (fee?: Fee) => this.create(fee),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial: obtiene tarifas y reservas (TripClient).
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      fees: this.feeService.getFees(),
      tripClients: this.tripClientService.getAllTripClients()
    }).subscribe({
      next: (results: any) => {
        // Cargar tarifas
        this.fees = results.fees.data;
        console.log('Tarifas cargadas:', this.fees.length, 'registros');

        // Construir opciones para el select de TripClient (reservas)
        const tripClientOptions = results.tripClients.data.map((tripClient: any) => ({
          value: tripClient.id,
          label: `${tripClient.client?.name || 'Cliente'} - ${tripClient.trip?.name || 'Viaje'} (${tripClient.trip?.destination || ''}) - $${tripClient.totalWithInterest || tripClient.trip?.price || 0}`
        }));

        // Definir los campos del formulario con las opciones cargadas
        this.fields = [
          { 
            name: 'tripClientId',
            label: 'Reserva (Cliente - Viaje)', 
            type: 'select',
            placeholder: 'Seleccione una reserva',
            required: true,
            options: tripClientOptions
          },
          { 
            name: 'installmentNumber',
            label: 'Número de Cuota', 
            type: 'number', 
            placeholder: 'Ej: 1, 2, 3...',
            required: true,
            min: 1,
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
            placeholder: 'Detalle de la cuota (opcional)',
            required: false,
            maxLength: 500,
          },
          { 
            name: 'dueDate',
            label: 'Fecha Límite de Pago', 
            type: 'date', 
            placeholder: 'Seleccione la fecha límite',
            required: true 
          },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            placeholder: 'Seleccione el estado',
            options: [
              { value: 'pending', label: 'Pendiente' },
              { value: 'paid', label: 'Pagado' },
              { value: 'overdue', label: 'Vencido' },
              { value: 'cancelled', label: 'Cancelado' },
              { value: 'refunded', label: 'Reembolsado' },
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
   * Recarga solo la lista de tarifas.
   */
  loadFees(): void {
    this.feeService.getFees().subscribe({
      next: (res: any) => {
        this.fees = res.data;
        console.log('Tarifas actualizadas:', this.fees.length, 'registros');
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
        next: () => {
          console.log('Tarifa actualizada exitosamente');
          this.loadFees();
        },
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
        next: () => {
          console.log('Tarifa creada exitosamente');
          this.loadFees();
        },
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
      next: () => {
        console.log('Tarifa eliminada exitosamente');
        this.loadFees();
      },
      error: (err) => console.error('Error al eliminar tarifa', err),
    });
  }
}