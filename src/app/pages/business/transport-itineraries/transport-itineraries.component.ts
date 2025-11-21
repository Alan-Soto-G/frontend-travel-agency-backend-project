import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { TransportItinerary } from 'src/app/models/business-models/transport-itinerary.model';
import { TransportItineraryService } from 'src/app/services/models/business-models/transport-itinerary.service';
import { JourneyService } from 'src/app/services/models/business-models/journey.service';
import { TripService } from 'src/app/services/models/business-models/trip.service';
import { TransportationServiceService } from 'src/app/services/models/business-models/transportation-service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

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
    'Trayecto',
    'Viaje',
    'Servicio de Transporte',
    'Orden',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'journeyRoute',
    'tripName',
    'transportServiceInfo',
    'order',
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
   * Cache de datos relacionados
   */
  private journeysCache: any[] = [];
  private tripsCache: any[] = [];
  private transportServicesCache: any[] = [];

  /**
   * Constructor: inicializa los servicios y las funciones CRUD.
   * @param transportItineraryService Servicio para gestionar los itinerarios de transporte
   * @param journeyService Servicio para obtener los trayectos
   * @param tripService Servicio para obtener los viajes
   * @param transportationServiceService Servicio para obtener los servicios de transporte
   */
  constructor(
    private transportItineraryService: TransportItineraryService,
    private journeyService: JourneyService,
    private tripService: TripService,
    private transportationServiceService: TransportationServiceService
  ) {
    this.arrayFunctions = {
      update: (id?: string, transportItinerary?: TransportItinerary) => 
        this.update(id, transportItinerary),
      create: (transportItinerary?: TransportItinerary) => 
        this.create(transportItinerary),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los itinerarios de transporte al montar el componente.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      transportItineraries: this.transportItineraryService.getTransportItineraries(),
      journeys: this.journeyService.getJourneys(),
      trips: this.tripService.getTrips(),
      transportServices: this.transportationServiceService.getTransportationServices()
    }).subscribe({
      next: (results: any) => {
        // Guardar en cache
        this.journeysCache = results.journeys?.data || results.journeys || [];
        this.tripsCache = results.trips?.data || results.trips || [];
        this.transportServicesCache = results.transportServices?.data || results.transportServices || [];

        // Crear mapas para búsqueda rápida
        const journeysMap = new Map(
          this.journeysCache.map((journey: any) => [journey._id || journey.id, journey])
        );
        const tripsMap = new Map(
          this.tripsCache.map((trip: any) => [trip._id || trip.id, trip])
        );
        const transportServicesMap = new Map(
          this.transportServicesCache.map((service: any) => [service._id || service.id, service])
        );

        // Enriquecer itinerarios con datos relacionados
        const itinerariesData = results.transportItineraries?.data || results.transportItineraries || [];
        this.transportItineraries = itinerariesData.map((itinerary: any) => {
          const journey = journeysMap.get(itinerary.journeyId);
          const trip = tripsMap.get(itinerary.tripId);
          const transportService = transportServicesMap.get(itinerary.transportationServiceId);

          return {
            ...itinerary,
            id: itinerary._id || itinerary.id,
            journeyRoute: journey 
              ? `${journey.originMunicipality?.name || 'Origen'} → ${journey.destinationMunicipality?.name || 'Destino'} (${journey.distance || 0} km)`
              : 'Sin trayecto',
            tripName: trip?.name || 'Sin viaje',
            transportServiceInfo: transportService 
              ? `${transportService.vehicle?.licensePlate || 'Sin vehículo'} - ${new Date(transportService.startDate).toLocaleDateString()}`
              : 'Sin servicio'
          };
        });

        console.log('Itinerarios de transporte cargados:', this.transportItineraries.length, 'registros');

        // Construir opciones para el select de trayectos
        const journeyOptions = this.journeysCache.map((journey: any) => ({
          value: journey._id || journey.id,
          label: `${journey.originMunicipality?.name || 'Origen'} → ${journey.destinationMunicipality?.name || 'Destino'} (${journey.distance || 0} km)`
        }));

        // Construir opciones para el select de viajes
        const tripOptions = this.tripsCache.map((trip: any) => ({
          value: trip._id || trip.id,
          label: `${trip.name || 'Sin nombre'} - ${trip.destination || 'Sin destino'} (Días: ${trip.durationDays || 0})`
        }));

        // Construir opciones para el select de servicios de transporte
        const transportServiceOptions = this.transportServicesCache.map((service: any) => ({
          value: service._id || service.id,
          label: `🚗 ${service.vehicle?.licensePlate || 'Sin vehículo'} - ${new Date(service.startDate).toLocaleDateString()} (Costo: $${service.cost || 0})`
        }));

        // Definir los campos del formulario con las opciones cargadas
        this.fields = [
          {
            name: 'journeyId',
            label: 'Trayecto',
            type: 'select',
            placeholder: 'Seleccione un trayecto',
            required: true,
            options: journeyOptions
          },
          {
            name: 'tripId',
            label: 'Viaje',
            type: 'select',
            placeholder: 'Seleccione un viaje',
            required: true,
            options: tripOptions
          },
          {
            name: 'transportationServiceId',
            label: 'Servicio de Transporte',
            type: 'select',
            placeholder: 'Seleccione un servicio de transporte',
            required: true,
            options: transportServiceOptions
          },
          {
            name: 'order',
            label: 'Orden',
            type: 'number',
            placeholder: 'Ingrese el orden del itinerario (1, 2, 3...)',
            required: true,
            min: 1,
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de itinerarios de transporte (con enriquecimiento de datos).
   */
  loadTransportItineraries(): void {
    this.transportItineraryService.getTransportItineraries().subscribe({
      next: (res: any) => {
        // Crear mapas para búsqueda rápida
        const journeysMap = new Map(
          this.journeysCache.map((journey: any) => [journey._id || journey.id, journey])
        );
        const tripsMap = new Map(
          this.tripsCache.map((trip: any) => [trip._id || trip.id, trip])
        );
        const transportServicesMap = new Map(
          this.transportServicesCache.map((service: any) => [service._id || service.id, service])
        );

        // Enriquecer itinerarios con datos relacionados
        const itinerariesData = res.data || res || [];
        this.transportItineraries = itinerariesData.map((itinerary: any) => {
          const journey = journeysMap.get(itinerary.journeyId);
          const trip = tripsMap.get(itinerary.tripId);
          const transportService = transportServicesMap.get(itinerary.transportationServiceId);

          return {
            ...itinerary,
            id: itinerary._id || itinerary.id,
            journeyRoute: journey 
              ? `${journey.originMunicipality?.name || 'Origen'} → ${journey.destinationMunicipality?.name || 'Destino'} (${journey.distance || 0} km)`
              : 'Sin trayecto',
            tripName: trip?.name || 'Sin viaje',
            transportServiceInfo: transportService 
              ? `${transportService.vehicle?.licensePlate || 'Sin vehículo'} - ${new Date(transportService.startDate).toLocaleDateString()}`
              : 'Sin servicio'
          };
        });

        console.log('Itinerarios actualizados:', this.transportItineraries.length, 'registros');
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
        next: () => {
          console.log('Itinerario de transporte actualizado exitosamente');
          this.loadTransportItineraries();
        },
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
        next: () => {
          console.log('Itinerario de transporte creado exitosamente');
          this.loadTransportItineraries();
        },
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
      next: () => {
        console.log('Itinerario de transporte eliminado exitosamente');
        this.loadTransportItineraries();
      },
      error: (err) => console.error('Error al eliminar itinerario de transporte', err),
    });
  }
}