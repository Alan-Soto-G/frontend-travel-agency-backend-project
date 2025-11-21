import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Journey } from 'src/app/models/business-models/journey.model';
import { JourneyService } from 'src/app/services/models/business-models/journey.service';
import { MunicipalityService } from 'src/app/services/models/business-models/municipality.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

/**
 * JourneysComponent
 *
 * Componente de página para la gestión de trayectos (Journeys).
 * Un trayecto representa una conexión entre dos municipios (origen y destino).
 *
 * Utiliza el servicio JourneyService para operaciones CRUD.
 */
@Component({
  selector: 'app-journeys',
  imports: [TableCrudComponent],
  templateUrl: './journeys.component.html',
})
export class JourneysComponent implements OnInit {
  /**
   * Lista de trayectos cargados desde el backend.
   */
  journeys: Journey[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Municipio Origen',
    'Municipio Destino',
    'Distancia (km)',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'originMunicipalityName',
    'destinationMunicipalityName',
    'distance',
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
  private municipalitiesCache: any[] = [];

  /**
   * Constructor: inicializa los servicios y las funciones CRUD.
   * @param journeyService Servicio para gestionar los trayectos
   * @param municipalityService Servicio para obtener los municipios
   */
  constructor(
    private journeyService: JourneyService,
    private municipalityService: MunicipalityService
  ) {
    this.arrayFunctions = {
      update: (id?: string, journey?: Journey) => this.update(id, journey),
      create: (journey?: Journey) => this.create(journey),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los trayectos al montar el componente.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      journeys: this.journeyService.getJourneys(),
      municipalities: this.municipalityService.getMunicipalities()
    }).subscribe({
      next: (results: any) => {
        // Guardar en cache
        this.municipalitiesCache = results.municipalities?.data || results.municipalities || [];

        // Crear mapa para búsqueda rápida
        const municipalitiesMap = new Map(
          this.municipalitiesCache.map((municipality: any) => [
            municipality._id || municipality.id, 
            municipality
          ])
        );

        // Enriquecer trayectos con nombres de municipios
        const journeysData = results.journeys?.data || results.journeys || [];
        this.journeys = journeysData.map((journey: any) => {
          const originMunicipality = municipalitiesMap.get(journey.originMunicipalityId);
          const destinationMunicipality = municipalitiesMap.get(journey.destinationMunicipalityId);

          return {
            ...journey,
            id: journey._id || journey.id,
            originMunicipalityName: originMunicipality 
              ? `${originMunicipality.name} (${originMunicipality.department})`
              : 'Sin origen',
            destinationMunicipalityName: destinationMunicipality 
              ? `${destinationMunicipality.name} (${destinationMunicipality.department})`
              : 'Sin destino'
          };
        });

        console.log('Trayectos cargados:', this.journeys.length, 'registros');

        // Construir opciones para el select de municipios
        const municipalityOptions = this.municipalitiesCache.map((municipality: any) => ({
          value: municipality._id || municipality.id,
          label: `📍 ${municipality.name} - ${municipality.department} (Código: ${municipality.code})`
        }));

        // Definir los campos del formulario con las opciones cargadas
        this.fields = [
          {
            name: 'originMunicipalityId',
            label: 'Municipio de Origen',
            type: 'select',
            placeholder: 'Seleccione el municipio de origen',
            required: true,
            options: municipalityOptions
          },
          {
            name: 'destinationMunicipalityId',
            label: 'Municipio de Destino',
            type: 'select',
            placeholder: 'Seleccione el municipio de destino',
            required: true,
            options: municipalityOptions
          },
          {
            name: 'distance',
            label: 'Distancia (km)',
            type: 'number',
            placeholder: 'Ingrese la distancia en kilómetros',
            required: true,
            min: 0,
            max: 50000,
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de trayectos (con enriquecimiento de datos).
   */
  loadJourneys(): void {
    this.journeyService.getJourneys().subscribe({
      next: (res: any) => {
        // Crear mapa para búsqueda rápida
        const municipalitiesMap = new Map(
          this.municipalitiesCache.map((municipality: any) => [
            municipality._id || municipality.id, 
            municipality
          ])
        );

        // Enriquecer trayectos con nombres de municipios
        const journeysData = res.data || res || [];
        this.journeys = journeysData.map((journey: any) => {
          const originMunicipality = municipalitiesMap.get(journey.originMunicipalityId);
          const destinationMunicipality = municipalitiesMap.get(journey.destinationMunicipalityId);

          return {
            ...journey,
            id: journey._id || journey.id,
            originMunicipalityName: originMunicipality 
              ? `${originMunicipality.name} (${originMunicipality.department})`
              : 'Sin origen',
            destinationMunicipalityName: destinationMunicipality 
              ? `${destinationMunicipality.name} (${destinationMunicipality.department})`
              : 'Sin destino'
          };
        });

        console.log('Trayectos actualizados:', this.journeys.length, 'registros');
      },
      error: (err) => console.error('Error al cargar trayectos', err),
    });
  }

  /**
   * Busca un trayecto por ID.
   * @param id ID del trayecto
   */
  findById(id: string): void {
    this.journeyService.getJourneyById(id).subscribe({
      next: (data) => console.log('Trayecto encontrado:', data),
      error: (err) => console.error('Error al buscar trayecto', err),
    });
  }

  /**
   * Actualiza un trayecto.
   * @param id ID del trayecto
   * @param journey Datos actualizados
   */
  update(id?: string, journey?: Journey): void {
    if (id && journey) {
      this.journeyService.updateJourney(id, journey).subscribe({
        next: () => {
          console.log('Trayecto actualizado exitosamente');
          this.loadJourneys();
        },
        error: (err) => console.error('Error al actualizar trayecto', err),
      });
    }
  }

  /**
   * Crea un nuevo trayecto.
   * @param journey Datos del nuevo trayecto
   */
  create(journey?: Journey): void {
    if (journey) {
      this.journeyService.createJourney(journey).subscribe({
        next: () => {
          console.log('Trayecto creado exitosamente');
          this.loadJourneys();
        },
        error: (err) => console.error('Error al crear trayecto', err),
      });
    }
  }

  /**
   * Elimina un trayecto.
   * @param id ID del trayecto a eliminar
   */
  delete(id: string): void {
    this.journeyService.deleteJourney(id).subscribe({
      next: () => {
        console.log('Trayecto eliminado exitosamente');
        this.loadJourneys();
      },
      error: (err) => console.error('Error al eliminar trayecto', err),
    });
  }
}