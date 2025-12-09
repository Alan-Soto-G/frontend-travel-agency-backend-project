import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Trip } from 'src/app/models/business-models/trip.model';
import { TripService } from 'src/app/services/models/business-models/trip.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * TripsComponent
 *
 * Componente de página para la gestión de viajes (Trips).
 * Muestra una tabla CRUD reutilizable para los viajes y define los campos y funciones específicas.
 * Utiliza el servicio TripService para operaciones CRUD.
 */
@Component({
  selector: 'app-trips',
  imports: [TableCrudComponent],
  templateUrl: './trips.component.html',
})
export class TripsComponent implements OnInit {
  /**
   * Lista de viajes cargados desde el backend.
   */
  trips: Trip[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Nombre',
    'Destino',
    'Precio',
    'Capacidad',
    'Disponibles',
    'Estado',
    'Fecha Inicio',
    'Fecha Fin',
    'Actualizar',
    'Eliminar'
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'name',
    'destination',
    'price',
    'capacity',
    'availableSeats',
    'status',
    'startDate',
    'endDate'
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
      name: 'name',
      label: 'Nombre del Viaje',
      type: 'text',
      placeholder: 'Ingrese el nombre del viaje',
      required: true,
      min: 3,
      max: 255,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Ingrese una descripción (opcional)',
      required: false,
      max: 500,
    },
    {
      name: 'destination',
      label: 'Destino',
      type: 'text',
      placeholder: 'Ingrese el destino del viaje',
      required: true,
      min: 3,
      max: 100,
    },
    {
      name: 'startDate',
      label: 'Fecha de Inicio',
      type: 'date',
      placeholder: 'Seleccione la fecha de inicio',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Fecha de Fin',
      type: 'date',
      placeholder: 'Seleccione la fecha de fin',
      required: true,
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'number',
      placeholder: 'Ingrese el precio del viaje',
      required: true,
    },
    {
      name: 'capacity',
      label: 'Capacidad',
      type: 'number',
      placeholder: 'Ingrese la capacidad total',
      required: true,
    },
    {
      name: 'availableSeats',
      label: 'Cupos Disponibles',
      type: 'number',
      placeholder: 'Ingrese los cupos disponibles',
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Borrador', value: 'draft' },
        { label: 'Publicado', value: 'published' },
        { label: 'Activo', value: 'active' },
        { label: 'Lleno', value: 'full' },
        { label: 'Completado', value: 'completed' },
        { label: 'Cancelado', value: 'cancelled' }
      ],
      required: true,
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param tripService Servicio para gestionar los viajes
   */
  constructor(private tripService: TripService) {
    this.arrayFunctions = {
      update: (id?: string, trip?: Trip) => this.update(id, trip),
      create: (trip?: Trip) => this.create(trip),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los viajes al montar el componente.
   */
  ngOnInit(): void {
    this.loadTrips();
  }

  /**
   * Carga la lista de viajes desde el backend.
   */
  loadTrips(): void {
    this.tripService.getTrips().subscribe({
      next: (res: any) => {
        this.trips = res.data;  // ✅ Solo el array de viajes
        console.log(this.trips); // Verifica que se cargue correctamente
      },
      error: (err) => console.error('Error al cargar viajes', err),
    });
  }

  /**
   * Busca un viaje por ID.
   * @param id ID del viaje
   */
  findById(id: string): void {
    this.tripService.getTripById(id).subscribe({
      next: (data) => console.log('Viaje encontrado:', data),
      error: (err) => console.error('Error al buscar viaje', err),
    });
  }

  /**
   * Actualiza un viaje.
   * @param id ID del viaje
   * @param trip Datos actualizados
   */
  update(id?: string, trip?: Trip): void {
    if (id && trip) {
      this.tripService.updateTrip(id, trip).subscribe({
        next: () => this.loadTrips(),
        error: (err) => console.error('Error al actualizar viaje', err),
      });
    }
  }

  /**
   * Crea un nuevo viaje.
   * @param trip Datos del nuevo viaje
   */
  create(trip?: Trip): void {
    if (trip) {
      this.tripService.createTrip(trip).subscribe({
        next: () => this.loadTrips(),
        error: (err) => console.error('Error al crear viaje', err),
      });
    }
  }

  /**
   * Elimina un viaje.
   * @param id ID del viaje a eliminar
   */
  delete(id: string): void {
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: (err) => console.error('Error al eliminar viaje', err),
    });
  }
}
