import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { TransportItinerary } from 'src/app/models/business-models/transport-itinerary.model';
import { TransportItineraryService } from 'src/app/services/models/business-models/transport-itinerary.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * TransportItinerariesComponent
 *
 * Componente de página para la gestión de itinerarios de transporte (Transport Itineraries).
 * Un itinerario de transporte representa la combinación de un transporte y un trayecto con horarios.
 *
 * Utiliza el servicio TransportItineraryService para operaciones CRUD.
 */
@Component({
  selector: 'app-transport-itineraries',
  imports: [TableCrudComponent],
  templateUrl: './transport-itineraries.component.html',
})
export class TransportItinerariesComponent implements OnInit {
  /**
   * Lista de itinerarios de transporte cargados desde el backend.
   */
  transportItineraries: TransportItinerary[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Journey ID',
    'Trip ID',
    'Service ID',
    'Orden',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'journeyId',
    'tripId',
    'transportationServiceId',
    'order',
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
      name: 'journeyId',
      label: 'Journey ID',
      type: 'number',
      placeholder: 'Ingrese el ID del trayecto',
      required: true,
      min: 1,
    },
    {
      name: 'tripId',
      label: 'Trip ID',
      type: 'number',
      placeholder: 'Ingrese el ID del viaje',
      required: true,
      min: 1,
    },
    {
      name: 'transportationServiceId',
      label: 'Transportation Service ID',
      type: 'number',
      placeholder: 'Ingrese el ID del servicio de transporte',
      required: true,
      min: 1,
    },
    {
      name: 'order',
      label: 'Orden',
      type: 'number',
      placeholder: 'Ingrese el orden del itinerario',
      required: true,
      min: 1,
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param transportItineraryService Servicio para gestionar los itinerarios de transporte
   */
  constructor(private transportItineraryService: TransportItineraryService) {
    this.arrayFunctions = {
      update: (id?: string, transportItinerary?: TransportItinerary) => this.update(id, transportItinerary),
      create: (transportItinerary?: TransportItinerary) => this.create(transportItinerary),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los itinerarios de transporte al montar el componente.
   */
  ngOnInit(): void {
    this.loadTransportItineraries();
  }

  /**
   * Carga la lista de itinerarios de transporte desde el backend.
   */
  loadTransportItineraries(): void {
    this.transportItineraryService.getTransportItineraries().subscribe({
      next: (res: any) => {
        this.transportItineraries = res.data;
        console.log('Itinerarios de transporte cargados:', this.transportItineraries.length, 'registros');
      },
      error: (err) => console.error('Error al cargar itinerarios de transporte', err),
    });
  }

  /**
   * Busca un itinerario de transporte por ID.
   * @param id ID del itinerario de transporte
   */
  findById(id: string): void {
    this.transportItineraryService.getTransportItineraryById(id).subscribe({
      next: (data) => console.log('Itinerario de transporte encontrado:', data),
      error: (err) => console.error('Error al buscar itinerario de transporte', err),
    });
  }

  /**
   * Actualiza un itinerario de transporte.
   * @param id ID del itinerario de transporte
   * @param transportItinerary Datos actualizados
   */
  update(id?: string, transportItinerary?: TransportItinerary): void {
    if (id && transportItinerary) {
      this.transportItineraryService.updateTransportItinerary(id, transportItinerary).subscribe({
        next: () => this.loadTransportItineraries(),
        error: (err) => console.error('Error al actualizar itinerario de transporte', err),
      });
    }
  }

  /**
   * Crea un nuevo itinerario de transporte.
   * @param transportItinerary Datos del nuevo itinerario de transporte
   */
  create(transportItinerary?: TransportItinerary): void {
    if (transportItinerary) {
      this.transportItineraryService.createTransportItinerary(transportItinerary).subscribe({
        next: () => this.loadTransportItineraries(),
        error: (err) => console.error('Error al crear itinerario de transporte', err),
      });
    }
  }

  /**
   * Elimina un itinerario de transporte.
   * @param id ID del itinerario de transporte a eliminar
   */
  delete(id: string): void {
    this.transportItineraryService.deleteTransportItinerary(id).subscribe({
      next: () => this.loadTransportItineraries(),
      error: (err) => console.error('Error al eliminar itinerario de transporte', err),
    });
  }
}

