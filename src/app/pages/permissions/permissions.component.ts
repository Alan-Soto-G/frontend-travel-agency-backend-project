import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Permission } from 'src/app/models/permission.model';
import { PermissionService } from 'src/app/services/permission.service';
import { FormField } from 'src/app/models/form-field.component';

/**
 * PermissionsComponent
 *
 * Componente de página para la gestión de permisos.
 * Muestra una tabla CRUD reutilizable para permisos y define los campos y funciones específicas.
 * Utiliza el servicio PermissionService para operaciones CRUD.
 */
@Component({
  selector: 'app-permissions',
  imports: [TableCrudComponent],
  templateUrl: './permissions.component.html',
})

export class PermissionsComponent implements OnInit {
  /**
   * Lista de permisos cargados desde el backend.
   */
  permissions: Permission[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = ['ID', 'URL', 'Modelo', 'Actualizar', 'Eliminar'];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = ['_id', 'url', 'model'];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      placeholder: 'Ingrese la URL (Ej: /api/users)',
      required: true,
      min: 3,
      max: 100
    },
    {
      name: 'model',
      label: 'Modelo',
      type: 'text',
      placeholder: 'Ingrese el modelo (Ej: User, Role, Permission)',
      required: true,
      min: 2,
      max: 50
    }
  ];


  /**
   * Constructor: inicializa el servicio y el diccionario de funciones CRUD.
   * @param permissionService Servicio de permisos para operaciones CRUD
   */
  constructor(private permissionService: PermissionService) {
    this.arrayFunctions = {
      update: (id?: string, permission?: Permission) => this.update(id, permission),
      create: (permission?: Permission) => this.create(permission),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Inicializa la carga de permisos al iniciar el componente.
   */
  ngOnInit(): void { this.loadPermissions(); }

  /**
   * Carga la lista de permisos desde el backend.
   */
  loadPermissions() {
    this.permissionService.getPermissions().subscribe({
      next: (data) => this.permissions = data,
      error: (err) => console.error('Error al cargar permisos', err)
    });
  }

  /**
   * Busca un permiso por su ID y lo muestra en consola.
   * @param id ID del permiso
   */
  findById(id: string): any {
    this.permissionService.getPermissionById(id).subscribe({
      next: (data) => console.log('Permiso encontrado:', data),
      error: (err) => console.error('Error al buscar permiso', err)
    });
  }

  /**
   * Actualiza un permiso existente.
   * @param id ID del permiso
   * @param permission Datos actualizados del permiso
   */
  update(id?: string, permission?: Permission): any {
    this.permissionService.updatePermission(id, permission).subscribe({
      next: () => this.loadPermissions(),
      error: (err) => console.error('Error al actualizar permiso', err)
    });
  }

  /**
   * Crea un nuevo permiso.
   * @param permission Datos del nuevo permiso
   */
  create(permission?: Permission): any {
    if (permission) {
      this.permissionService.createPermission(permission).subscribe({
        next: () => this.loadPermissions(),
        error: (err) => console.error('Error al crear permiso', err)
      });
    }
  }

  /**
   * Elimina un permiso por su ID.
   * @param id ID del permiso a eliminar
   */
  delete(id: string): any {
    this.permissionService.deletePermission(id).subscribe({
      next: () => this.loadPermissions(),
      error: (err) => console.error('Error al eliminar permiso', err)
    });
  }
}
