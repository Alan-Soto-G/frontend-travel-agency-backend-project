import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Municipality } from 'src/app/models/business-models/municipality';
import { MunicipalityService } from 'src/app/services/models/business-models/municipality.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

/**
 * MunicipalitiesComponent
 *
 * Componente de página para la gestión de municipios (Municipalities).
 * Utiliza el servicio MunicipalityService para operaciones CRUD.
 */
@Component({
  selector: 'app-municipalities',
  imports: [TableCrudComponent],
  templateUrl: './municipalities.component.html',
})
export class MunicipalitiesComponent implements OnInit {
  /**
   * Lista de municipios cargados desde el backend.
   */
  municipalities: Municipality[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Nombre',
    'Departamento',
    'Código',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'name',
    'department',
    'code',
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
   * @param municipalityService Servicio para gestionar los municipios
   */
  constructor(private municipalityService: MunicipalityService) {
    this.arrayFunctions = {
      update: (id?: string, municipality?: Municipality) => this.update(id, municipality),
      create: (municipality?: Municipality) => this.create(municipality),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los municipios al montar el componente.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      municipalities: this.municipalityService.getMunicipalities()
    }).subscribe({
      next: (results: any) => {
        this.municipalities = results.municipalities.data || results.municipalities;
        
        console.log('Municipios cargados:', this.municipalities.length, 'registros');

        // Definir los campos del formulario
        this.fields = [
          {
            name: 'name',
            label: 'Nombre del Municipio',
            type: 'text',
            placeholder: 'Ingrese el nombre del municipio (ej: Manizales)',
            required: true,
            minLength: 2,
            maxLength: 100,
          },
          {
            name: 'department',
            label: 'Departamento',
            type: 'text',
            placeholder: 'Ingrese el departamento (ej: Caldas)',
            required: true,
            minLength: 2,
            maxLength: 100,
          },
          {
            name: 'code',
            label: 'Código',
            type: 'text',
            placeholder: 'Ingrese el código del municipio (ej: 17001)',
            required: true,
            minLength: 2,
            maxLength: 20,
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de municipios.
   */
  loadMunicipalities(): void {
    this.municipalityService.getMunicipalities().subscribe({
      next: (res: any) => {
        this.municipalities = res.data || res;
        console.log('Municipios actualizados:', this.municipalities.length, 'registros');
      },
      error: (err) => console.error('Error al cargar municipios', err),
    });
  }

  /**
   * Busca un municipio por ID.
   * @param id ID del municipio
   */
  findById(id: string): void {
    this.municipalityService.getMunicipalityById(id).subscribe({
      next: (data) => console.log('Municipio encontrado:', data),
      error: (err) => console.error('Error al buscar municipio', err),
    });
  }

  /**
   * Actualiza un municipio.
   * @param id ID del municipio
   * @param municipality Datos actualizados
   */
  update(id?: string, municipality?: Municipality): void {
    if (id && municipality) {
      this.municipalityService.updateMunicipality(id, municipality).subscribe({
        next: () => {
          console.log('Municipio actualizado exitosamente');
          this.loadMunicipalities();
        },
        error: (err) => console.error('Error al actualizar municipio', err),
      });
    }
  }

  /**
   * Crea un nuevo municipio.
   * @param municipality Datos del nuevo municipio
   */
  create(municipality?: Municipality): void {
    if (municipality) {
      this.municipalityService.createMunicipality(municipality).subscribe({
        next: () => {
          console.log('Municipio creado exitosamente');
          this.loadMunicipalities();
        },
        error: (err) => console.error('Error al crear municipio', err),
      });
    }
  }

  /**
   * Elimina un municipio.
   * @param id ID del municipio a eliminar
   */
  delete(id: string): void {
    this.municipalityService.deleteMunicipality(id).subscribe({
      next: () => {
        console.log('Municipio eliminado exitosamente');
        this.loadMunicipalities();
      },
      error: (err) => console.error('Error al eliminar municipio', err),
    });
  }
}