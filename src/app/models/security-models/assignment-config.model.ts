export interface GenericEntity {
  _id: string;
  name: string;
  [key: string]: any;
}

export interface AssignmentConfig {
  // Configuración de la tabla
  entityName: string; // ej: "Usuario", "Proyecto", "Equipo"
  assignmentName: string; // ej: "Rol", "Permiso", "Categoría"
  tableTitle: string; // ej: "Usuarios y Roles 📋"

  // Configuración de búsquedas
  entitySearchPlaceholder: string; // ej: "Escribir nombre de usuario..."
  assignmentSelectPlaceholder: string; // ej: "Seleccionar rol..."

  // Configuración de botones
  listAllButtonText: string; // ej: "Listar Todo"
  manageButtonText: string; // ej: "Administrar"

  // Configuración de mensajes
  noAssignmentsMessage: string; // ej: "Sin roles asignados"
  noEntityFoundMessage: string; // ej: "Nadie posee este rol"
  modalTitle: string; // ej: "Administrar roles para {entityName}"

  // Propiedades de visualización
  lenSlice: number;
}

export interface AssignmentRelation {
  _id: string;
  entity: GenericEntity; // usuario, proyecto, etc.
  assignment: GenericEntity; // rol, permiso, etc.
}
