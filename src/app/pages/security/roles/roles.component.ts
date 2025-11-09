import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from '../../../components/table-crud/table-crud.component';
import { Role } from '../../../models/security-models/role.model';
import { RoleService } from '../../../services/models/security-models/role.service';
import { FormField } from '../../../models/security-models/form-field.component';

/**
 * RolesComponent
 *
 * Componente de página para la gestión de roles.
 * Muestra una tabla CRUD reutilizable para roles y define los campos y funciones específicas.
 * Utiliza el servicio RoleService para operaciones CRUD.
 */
@Component({
  selector: 'app-roles',
  imports: [TableCrudComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  /**
   * Lista de roles cargados desde el backend.
   */
  roles: Role[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = ['ID', 'Nombre', 'Descripción', 'Actualizar', 'Eliminar'];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = ['_id', 'name', 'description'];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [
    { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre del rol', required: true, min: 3, max: 50 },
    { name: 'description', label: 'Descripción', type: 'text', placeholder: 'Ingrese la descripción del rol', required: true, min: 10, max: 200 }
  ];

  /**
   * Constructor: inicializa el servicio y el diccionario de funciones CRUD.
   * @param roleService Servicio de roles para operaciones CRUD
   */
  constructor(private roleService: RoleService) {
    this.arrayFunctions = {
      update: (id?: string, role?: Role) => this.update(id, role),
      create: (role?: Role) => this.create(role),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Inicializa la carga de roles al iniciar el componente.
   */
  ngOnInit(): void {
    this.loadRoles();
  }

  /**
   * Carga la lista de roles desde el backend.
   */
  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  /**
   * Busca un rol por su ID.
   * @param id ID del rol
   */
  findById(id: string): any {
    this.roleService.getRoleById(id).subscribe({
      next: (data) => console.log('Rol encontrado:', data),
      error: (err) => console.error('Error al buscar rol', err)
    });
  }

  /**
   * Actualiza un rol existente.
   * @param id ID del rol
   * @param role Datos actualizados del rol
   */
  update(id?: string, role?: Role): any {
    this.roleService.updateRole(id!, role!).subscribe({
      next: () => this.loadRoles(),
      error: (err) => console.error('Error al actualizar rol', err)
    });
  }

  /**
   * Crea un nuevo rol.
   * @param role Datos del nuevo rol
   */
  create(role?: Role): any {
    this.roleService.createRole(role!).subscribe({
      next: () => this.loadRoles(),
      error: (err) => console.error('Error al crear rol', err)
    });
  }

  /**
   * Elimina un rol existente.
   * @param id ID del rol a eliminar
   */
  delete(id: string): any {
    this.roleService.deleteRole(id).subscribe({
      next: () => this.loadRoles(),
      error: (err) => console.error('Error al eliminar rol', err)
    });
  }
}
