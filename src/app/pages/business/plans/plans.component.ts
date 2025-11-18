import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Plan } from 'src/app/models/business-models/plan.model';
import { PlanService } from 'src/app/services/models/business-models/plan.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * PlansComponent
 *
 * Componente de página para la gestión de planes (Plans).
 * Permite crear, listar, actualizar y eliminar planes.
 *
 * Utiliza el servicio PlanService para operaciones CRUD.
 */
@Component({
  selector: 'app-plans',
  imports: [TableCrudComponent],
  templateUrl: './plans.component.html',
})
export class PlansComponent implements OnInit {
  /**
   * Lista de planes cargados desde el backend.
   */
  plans: Plan[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Nombre',
    'Descripción',
    'Precio',
    'Duración (días)',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'name',
    'description',
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
      name: 'name',
      label: 'Nombre del Plan',
      type: 'text',
      placeholder: 'Ingrese el nombre del plan',
      required: true,
      min: 3,
      max: 150,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Ingrese una descripción (opcional)',
      required: false,
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'number',
      placeholder: 'Ingrese el precio del plan',
      required: true,
      min: 0,
    },
    {
      name: 'duration',
      label: 'Duración (días)',
      type: 'number',
      placeholder: 'Ingrese la duración en días (1-365)',
      required: false,
      min: 1,
      max: 365,
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param planService Servicio para gestionar los planes
   */
  constructor(private planService: PlanService) {
    this.arrayFunctions = {
      update: (id?: string, plan?: Plan) => this.update(id, plan),
      create: (plan?: Plan) => this.create(plan),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los planes al montar el componente.
   */
  ngOnInit(): void {
    this.loadPlans();
  }

  /**
   * Carga la lista de planes desde el backend.
   */
  loadPlans(): void {
    this.planService.getPlans().subscribe({
      next: (res: any) => {
        this.plans = res.data;
        console.log('Planes cargados:', this.plans.length, 'registros');
      },
      error: (err) => console.error('Error al cargar planes', err),
    });
  }

  /**
   * Busca un plan por ID.
   * @param id ID del plan
   */
  findById(id: string): void {
    this.planService.getPlanById(id).subscribe({
      next: (data) => console.log('Plan encontrado:', data),
      error: (err) => console.error('Error al buscar plan', err),
    });
  }

  /**
   * Actualiza un plan.
   * @param id ID del plan
   * @param plan Datos actualizados
   */
  update(id?: string, plan?: Plan): void {
    if (id && plan) {
      this.planService.updatePlan(id, plan).subscribe({
        next: () => this.loadPlans(),
        error: (err) => console.error('Error al actualizar plan', err),
      });
    }
  }

  /**
   * Crea un nuevo plan.
   * @param plan Datos del nuevo plan
   */
  create(plan?: Plan): void {
    if (plan) {
      this.planService.createPlan(plan).subscribe({
        next: () => this.loadPlans(),
        error: (err) => console.error('Error al crear plan', err),
      });
    }
  }

  /**
   * Elimina un plan.
   * @param id ID del plan a eliminar
   */
  delete(id: string): void {
    this.planService.deletePlan(id).subscribe({
      next: () => this.loadPlans(),
      error: (err) => console.error('Error al eliminar plan', err),
    });
  }
}

