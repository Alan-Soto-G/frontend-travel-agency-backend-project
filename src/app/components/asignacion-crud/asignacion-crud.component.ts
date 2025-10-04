import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericEntity, AssignmentConfig, AssignmentRelation } from '../../models/assignment-config.model';

@Component({
  selector: 'app-asignacion-crud',
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion-crud.component.html',
  styleUrl: './asignacion-crud.component.scss'
})
export class AsignacionCrudComponent {
  // Datos genéricos
  @Input() entities: GenericEntity[] = []; // usuarios, proyectos, etc.
  @Input() assignments: GenericEntity[] = []; // roles, permisos, etc.
  @Input() entityAssignments: Record<string, GenericEntity[]> = {}; // entityId -> array de assignments
  @Input() allEntities: GenericEntity[] = []; // Todas las entidades para búsquedas
  @Input() config: AssignmentConfig = {
    entityName: 'Usuario',
    assignmentName: 'Rol',
    tableTitle: 'Asignaciones 📋',
    entitySearchPlaceholder: 'Escribir nombre...',
    assignmentSelectPlaceholder: 'Seleccionar...',
    listAllButtonText: 'Listar Todo',
    manageButtonText: 'Administrar',
    noAssignmentsMessage: 'Sin asignaciones',
    noEntityFoundMessage: 'Nadie posee esta asignación',
    modalTitle: 'Administrar {assignmentName} para {entityName}',
    lenSlice: 2
  };

  // Estados de la vista
  @Input() isSearchMode: boolean = false;
  @Input() searchType: string = ''; // 'entity' o 'assignment'
  @Input() isLoading: boolean = false;

  // Eventos genéricos
  @Output() onAssignmentToggle = new EventEmitter<{entity: GenericEntity, assignment: GenericEntity, checked: boolean}>();
  @Output() onListAll = new EventEmitter<void>();
  @Output() onSearchByEntity = new EventEmitter<string>();
  @Output() onSearchByAssignment = new EventEmitter<string>();

  // Estado interno del componente
  selectedEntity: GenericEntity | null = null;
  showModal = false;

  // Variables para búsquedas
  selectedEntityForSearch: string = '';
  selectedAssignmentForSearch: string = '';
  private lastSearchedEntityId: string = '';
  private lastSearchedAssignmentId: string = '';

  // Variables para el autocompletado de entidades
  entitySearchText: string = '';
  filteredEntities: GenericEntity[] = [];
  showEntityDropdown: boolean = false;
  selectedEntityFromDropdown: GenericEntity | null = null;

  /**
   * Abre el modal de administración de asignaciones para una entidad específica
   */
  openAssignmentModal(entity: GenericEntity) {
    this.selectedEntity = entity;
    this.showModal = true;
  }

  /**
   * Verifica si una asignación está asignada a la entidad seleccionada
   */
  isAssignmentChecked(assignmentId: string): boolean {
    if (!this.selectedEntity) return false;
    return this.entityAssignments[this.selectedEntity._id]?.some(assignment => assignment._id === assignmentId) || false;
  }

  /**
   * Maneja el cambio de estado de un checkbox de asignación
   */
  onToggleAssignment(assignment: GenericEntity, event: any) {
    if (!this.selectedEntity) return;

    this.onAssignmentToggle.emit({
      entity: this.selectedEntity,
      assignment: assignment,
      checked: event.target.checked
    });
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    this.showModal = false;
    this.selectedEntity = null;
  }

  /**
   * Maneja el clic en el backdrop del modal para cerrarlo
   */
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Filtra las entidades según el texto de búsqueda
   */
  onEntitySearchTextChange(): void {
    if (this.entitySearchText.length > 0) {
      this.filteredEntities = this.allEntities.filter(entity =>
        entity.name.toLowerCase().includes(this.entitySearchText.toLowerCase())
      );
      this.showEntityDropdown = this.filteredEntities.length > 0;
    } else {
      this.filteredEntities = [];
      this.showEntityDropdown = false;
    }
    this.selectedEntityFromDropdown = null;
  }

  /**
   * Selecciona una entidad de la lista filtrada
   */
  selectEntityFromDropdown(entity: GenericEntity): void {
    this.selectedEntityFromDropdown = entity;
    this.entitySearchText = entity.name;
    this.showEntityDropdown = false;
    this.filteredEntities = [];
  }

  /**
   * Busca asignaciones por entidad
   */
  searchByEntity() {
    if (this.selectedEntityFromDropdown && this.selectedEntityFromDropdown._id !== this.lastSearchedEntityId) {
      this.lastSearchedEntityId = this.selectedEntityFromDropdown._id;
      this.onSearchByEntity.emit(this.selectedEntityFromDropdown._id);
      // Limpiar formularios después de buscar
      this.entitySearchText = '';
      this.selectedEntityFromDropdown = null;
      this.selectedAssignmentForSearch = '';
      this.lastSearchedAssignmentId = '';
      this.showEntityDropdown = false;
      this.filteredEntities = [];
    }
  }

  /**
   * Busca entidades por asignación
   */
  searchByAssignment() {
    if (this.selectedAssignmentForSearch && this.selectedAssignmentForSearch !== this.lastSearchedAssignmentId) {
      this.lastSearchedAssignmentId = this.selectedAssignmentForSearch;
      this.onSearchByAssignment.emit(this.selectedAssignmentForSearch);
      // Limpiar formularios después de buscar
      this.selectedEntityForSearch = '';
      this.selectedAssignmentForSearch = '';
      this.lastSearchedEntityId = '';
    }
  }

  /**
   * Maneja el clic en acciones (listar todo)
   */
  handleActionClick(action: string) {
    if (action === 'listAll') {
      // Limpiar formularios y variables de control
      this.entitySearchText = '';
      this.selectedEntityFromDropdown = null;
      this.selectedAssignmentForSearch = '';
      this.lastSearchedEntityId = '';
      this.lastSearchedAssignmentId = '';
      this.showEntityDropdown = false;
      this.filteredEntities = [];
      this.onListAll.emit();
    }
  }

  /**
   * Verifica si debe mostrar el mensaje de "Nadie posee esta asignación"
   */
  shouldShowNoAssignmentMessage(): boolean {
    return this.isSearchMode &&
           this.searchType === 'assignment' &&
           this.entities.length === 0 &&
           !this.isLoading;
  }

  /**
   * Verifica si debe mostrar la fila de entidad sin asignaciones
   */
  shouldShowEntityWithoutAssignments(): boolean {
    return this.isSearchMode && this.searchType === 'entity' && this.entities.length === 0;
  }

  /**
   * Obtiene la entidad buscada (para mostrar sin asignaciones si no tiene)
   */
  getSearchedEntity(): GenericEntity | null {
    if (this.shouldShowEntityWithoutAssignments() && this.selectedEntityForSearch) {
      return this.allEntities.find(e => e._id === this.selectedEntityForSearch) || null;
    }
    return null;
  }

  /**
   * Genera el título del modal dinámicamente
   */
  getModalTitle(): string {
    if (!this.selectedEntity) return '';
    return this.config.modalTitle
      .replace('{entityName}', this.selectedEntity.name)
      .replace('{assignmentName}', this.config.assignmentName);
  }
}
