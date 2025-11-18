import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { TouristActivity } from 'src/app/models/business-models/tourist-activity.model';
import { TouristActivityService } from 'src/app/services/models/business-models/tourist-activity.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * TouristActivitiesComponent
 *
 * Componente de página para la gestión de actividades turísticas (Tourist Activities).
 * Permite crear, listar, actualizar y eliminar actividades turísticas.
 *
 * Utiliza el servicio TouristActivityService para operaciones CRUD.
 */
@Component({
  selector: 'app-tourist-activities',
  imports: [TableCrudComponent],
  templateUrl: './tourist-activities.component.html',
})
export class TouristActivitiesComponent implements OnInit {
  /**
   * Lista de actividades turísticas cargadas desde el backend.
   */
  touristActivities: TouristActivity[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Municipio ID',
    'Nombre',
    'Categoría',
    'Precio',
    'Duración (min)',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'municipalityId',
    'name',
    'category',
    'price',
    'duration',
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
      name: 'municipalityId',
      label: 'Municipio ID',
      type: 'number',
      placeholder: 'Ingrese el ID del municipio',
      required: true
    },
    {
      name: 'name',
      label: 'Nombre de la Actividad',
      type: 'text',
      placeholder: 'Ingrese el nombre de la actividad',
      required: true,
      min: 3,
      max: 150,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Ingrese la descripción (opcional)',
      required: false
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'number',
      placeholder: 'Ingrese el precio (opcional)',
      required: false,
      min: 0
    },
    {
      name: 'duration',
      label: 'Duración (minutos)',
      type: 'number',
      placeholder: 'Duración en minutos (1-480)',
      required: false,
      min: 1,
      max: 480
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      placeholder: 'Seleccione la categoría',
      required: false,
      options: [
        { value: 'cultural', text: 'Cultural' },
        { value: 'adventure', text: 'Aventura' },
        { value: 'gastronomic', text: 'Gastronómica' },
        { value: 'recreational', text: 'Recreativa' },
        { value: 'ecological', text: 'Ecológica' },
        { value: 'aquatic', text: 'Acuática' },
        { value: 'other', text: 'Otra' }
      ]
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param touristActivityService Servicio para gestionar las actividades turísticas
   */
  constructor(private touristActivityService: TouristActivityService) {
    this.arrayFunctions = {
      update: (id?: string, activity?: TouristActivity) => this.update(id, activity),
      create: (activity?: TouristActivity) => this.create(activity),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de las actividades al montar el componente.
   */
  ngOnInit(): void {
    this.loadActivities();
  }

  /**
   * Carga la lista de actividades turísticas desde el backend.
   */
  loadActivities(): void {
    this.touristActivityService.getTouristActivities().subscribe({
      next: (res: any) => {
        this.touristActivities = res.data;
        console.log('Actividades turísticas cargadas:', this.touristActivities.length, 'registros');
      },
      error: (err) => console.error('Error al cargar actividades turísticas', err),
    });
  }

  /**
   * Busca una actividad por ID.
   * @param id ID de la actividad
   */
  findById(id: string): void {
    this.touristActivityService.getTouristActivityById(id).subscribe({
      next: (data) => console.log('Actividad encontrada:', data),
      error: (err) => console.error('Error al buscar actividad', err),
    });
  }

  /**
   * Actualiza una actividad.
   * @param id ID de la actividad
   * @param activity Datos actualizados
   */
  update(id?: string, activity?: TouristActivity): void {
    if (id && activity) {
      this.touristActivityService.updateTouristActivity(id, activity).subscribe({
        next: () => this.loadActivities(),
        error: (err) => console.error('Error al actualizar actividad', err),
      });
    }
  }

  /**
   * Crea una nueva actividad.
   * @param activity Datos de la nueva actividad
   */
  create(activity?: TouristActivity): void {
    if (activity) {
      this.touristActivityService.createTouristActivity(activity).subscribe({
        next: () => this.loadActivities(),
        error: (err) => console.error('Error al crear actividad', err),
      });
    }
  }

  /**
   * Elimina una actividad.
   * @param id ID de la actividad a eliminar
   */
  delete(id: string): void {
    this.touristActivityService.deleteTouristActivity(id).subscribe({
      next: () => this.loadActivities(),
      error: (err) => console.error('Error al eliminar actividad', err),
    });
  }
}

