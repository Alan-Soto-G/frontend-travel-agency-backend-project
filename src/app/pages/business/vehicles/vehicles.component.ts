import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Vehicle } from 'src/app/models/business-models/vehicle.model';
import { VehicleService } from 'src/app/services/models/business-models/vehicle.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

/**
 * VehiclesComponent
 *
 * Componente de página para la gestión de vehículos (Vehicles).
 * Utiliza el servicio VehicleService para operaciones CRUD.
 */
@Component({
  selector: 'app-vehicles',
  imports: [TableCrudComponent],
  templateUrl: './vehicles.component.html',
})
export class VehiclesComponent implements OnInit {
  /**
   * Lista de vehículos cargados desde el backend.
   */
  vehicles: Vehicle[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Placa',
    'Marca',
    'Modelo',
    'Año',
    'Color',
    'Asientos',
    'Tipo',
    'Estado',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'licensePlate',
    'brand',
    'model',
    'year',
    'color',
    'numberOfSeats',
    'vehicleType',
    'status',
  ];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param vehicleService Servicio para gestionar los vehículos
   */
  constructor(private vehicleService: VehicleService) {
    this.arrayFunctions = {
      update: (id?: string, vehicle?: Vehicle) => this.update(id, vehicle),
      create: (vehicle?: Vehicle) => this.create(vehicle),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los vehículos al montar el componente.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      vehicles: this.vehicleService.getVehicles()
    }).subscribe({
      next: (results: any) => {
        this.vehicles = results.vehicles.data;

        console.log('Vehículos cargados:', this.vehicles.length, 'registros');

        // Definir los campos del formulario
        this.fields = [
          {
            name: 'licensePlate',
            label: 'Placa',
            type: 'text',
            placeholder: 'Ingrese la placa del vehículo (ej: ABC123)',
            required: true,
            minLength: 2,
            maxLength: 20,
          },
          {
            name: 'brand',
            label: 'Marca',
            type: 'text',
            placeholder: 'Ingrese la marca del vehículo',
            required: true,
            minLength: 2,
            maxLength: 50,
          },
          {
            name: 'model',
            label: 'Modelo',
            type: 'text',
            placeholder: 'Ingrese el modelo del vehículo',
            required: true,
            minLength: 1,
            maxLength: 50,
          },
          {
            name: 'year',
            label: 'Año',
            type: 'number',
            placeholder: 'Ingrese el año del vehículo (ej: 2024)',
            required: true,
            min: 1900,
            max: 2100,
          },
          {
            name: 'color',
            label: 'Color',
            type: 'text',
            placeholder: 'Ingrese el color del vehículo',
            required: true,
            minLength: 2,
            maxLength: 30,
          },
          {
            name: 'numberOfSeats',
            label: 'Número de Asientos',
            type: 'number',
            placeholder: 'Ingrese el número de asientos',
            required: true,
            min: 1,
            max: 100,
          },
          {
            name: 'vehicleType',
            label: 'Tipo de Vehículo',
            type: 'select',
            placeholder: 'Seleccione el tipo de vehículo',
            required: true,
            options: [
              { value: 'bus', label: '🚌 Bus' },
              { value: 'van', label: '🚐 Van' },
              { value: 'car', label: '🚗 Auto' },
              { value: 'minibus', label: '🚙 Minibús' },
              { value: 'suv', label: '🚙 SUV' },
              { value: 'other', label: '🚘 Otro' },
            ],
          },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            placeholder: 'Seleccione el estado',
            required: true,
            options: [
              { value: 'available', label: '✅ Disponible' },
              { value: 'in_use', label: '🚗 En Uso' },
              { value: 'maintenance', label: '🔧 Mantenimiento' },
              { value: 'retired', label: '🚫 Retirado' }
            ]
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de vehículos.
   */
  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (res: any) => {
        this.vehicles = res.data;
        console.log('Vehículos actualizados:', this.vehicles.length, 'registros');
      },
      error: (err) => console.error('Error al cargar vehículos', err),
    });
  }

  /**
   * Busca un vehículo por ID.
   * @param id ID del vehículo
   */
  findById(id: string): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (data) => console.log('Vehículo encontrado:', data),
      error: (err) => console.error('Error al buscar vehículo', err),
    });
  }

  /**
   * Actualiza un vehículo.
   * @param id ID del vehículo
   * @param vehicle Datos actualizados
   */
  update(id?: string, vehicle?: Vehicle): void {
    if (id && vehicle) {
      this.vehicleService.updateVehicle(id, vehicle).subscribe({
        next: () => {
          console.log('Vehículo actualizado exitosamente');
          this.loadVehicles();
        },
        error: (err) => console.error('Error al actualizar vehículo', err),
      });
    }
  }

  /**
   * Crea un nuevo vehículo.
   * @param vehicle Datos del nuevo vehículo
   */
  create(vehicle?: Vehicle): void {
    if (vehicle) {
      this.vehicleService.createVehicle(vehicle).subscribe({
        next: () => {
          console.log('Vehículo creado exitosamente');
          this.loadVehicles();
        },
        error: (err) => console.error('Error al crear vehículo', err),
      });
    }
  }

  /**
   * Elimina un vehículo.
   * @param id ID del vehículo a eliminar
   */
  delete(id: string): void {
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => {
        console.log('Vehículo eliminado exitosamente');
        this.loadVehicles();
      },
      error: (err) => console.error('Error al eliminar vehículo', err),
    });
  }
}