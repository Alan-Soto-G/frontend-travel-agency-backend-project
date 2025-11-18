import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Journey } from 'src/app/models/business-models/journey.model';
import { JourneyService } from 'src/app/services/models/business-models/journey.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

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
    'Municipio Origen ID',
    'Municipio Destino ID',
    'Distancia (km)',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'originMunicipalityId',
    'destinationMunicipalityId',
    'distance',
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
      name: 'originMunicipalityId',
      label: 'Municipio de Origen ID',
      type: 'number',
      placeholder: 'Ingrese el ID del municipio de origen',
      required: true,
    },
    {
      name: 'destinationMunicipalityId',
      label: 'Municipio de Destino ID',
      type: 'number',
      placeholder: 'Ingrese el ID del municipio de destino',
      required: true,
    },
    {
      name: 'distance',
      label: 'Distancia (km)',
      type: 'number',
      placeholder: 'Ingrese la distancia en kilómetros (0-50000)',
      required: false,
      min: 0,
      max: 50000,
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param journeyService Servicio para gestionar los trayectos
   */
  constructor(private journeyService: JourneyService) {
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
    this.loadJourneys();
  }

  /**
   * Carga la lista de trayectos desde el backend.
   */
  loadJourneys(): void {
    this.journeyService.getJourneys().subscribe({
      next: (res: any) => {
        this.journeys = res.data;
        console.log('Trayectos cargados:', this.journeys.length, 'registros');
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
        next: () => this.loadJourneys(),
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
        next: () => this.loadJourneys(),
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
      next: () => this.loadJourneys(),
      error: (err) => console.error('Error al eliminar trayecto', err),
    });
  }
}

