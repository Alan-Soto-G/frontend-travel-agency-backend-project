import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-asignacion-crud',
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion-crud.component.html',
  styleUrl: './asignacion-crud.component.scss'
})
export class AsignacionCrudComponent {
  @Input() users: User[] = [];
  @Input() roles: Role[] = [];
  @Input() userRoles: Record<string, Role[]> = {};
  @Input() typeOfCrud: string = '';
  @Input() lenSlice: number = 2;
  @Input() allUsers: User[] = []; // Todos los usuarios para búsquedas y crear
  @Output() onRoleToggle = new EventEmitter<{user: User, role: Role, checked: boolean}>();
  @Output() onCreateAssignment = new EventEmitter<{userId: string, roleId: string}>();
  @Output() onSearchByUser = new EventEmitter<string>();
  @Output() onSearchByRole = new EventEmitter<string>();

  selectedUser: User | null = null;
  showModal = false;
  showCreateModal = false;

  // Variables para búsquedas
  selectedUserForSearch: string = '';
  selectedRoleForSearch: string = '';

  // Variables para crear
  selectedUserForCreate: string = '';
  selectedRolesForCreate: Set<string> = new Set();

  /**
   * Abre el modal de administración de roles para un usuario específico
   * @param user Usuario seleccionado
   */
  openRoleModal(user: User) {
    this.selectedUser = user;
    this.showModal = true;
  }

  /**
   * Verifica si un rol está asignado al usuario seleccionado
   * @param roleId ID del rol a verificar
   * @returns true si el rol está asignado, false en caso contrario
   */
  isRoleChecked(roleId: string): boolean {
    if (!this.selectedUser) return false;
    return this.userRoles[this.selectedUser._id]?.some(role => role._id === roleId) || false;
  }

  /**
   * Maneja el cambio de estado de un checkbox de rol
   * @param role Rol que cambió de estado
   * @param event Evento del checkbox
   */
  onToggleRole(role: Role, event: any) {
    if (!this.selectedUser) return;

    this.onRoleToggle.emit({
      user: this.selectedUser,
      role: role,
      checked: event.target.checked
    });
  }

  /**
   * Cierra el modal de administración de roles
   */
  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  /**
   * Maneja el clic en el backdrop del modal para cerrarlo
   * @param event Evento del clic
   */
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Maneja el clic en acciones (crear)
   * @param action Acción a realizar
   */
  handleActionClick(action: string) {
    if (action === 'create') {
      this.openCreateModal();
    }
  }

  /**
   * Abre el modal de crear asignación
   */
  openCreateModal() {
    this.showCreateModal = true;
    this.selectedUserForCreate = '';
    this.selectedRolesForCreate.clear();
  }

  /**
   * Cierra el modal de crear asignación
   */
  closeCreateModal() {
    this.showCreateModal = false;
    this.selectedUserForCreate = '';
    this.selectedRolesForCreate.clear();
  }

  /**
   * Maneja el cambio de rol en el modal de crear
   * @param roleId ID del rol
   * @param event Evento del checkbox
   */
  onCreateRoleToggle(roleId: string, event: any) {
    if (event.target.checked) {
      this.selectedRolesForCreate.add(roleId);
    } else {
      this.selectedRolesForCreate.delete(roleId);
    }

    // Si hay un usuario seleccionado, crear/eliminar asignaciones inmediatamente
    if (this.selectedUserForCreate) {
      const role = this.roles.find(r => r._id === roleId);
      if (role) {
        this.onCreateAssignment.emit({
          userId: this.selectedUserForCreate,
          roleId: roleId
        });
      }
    }
  }

  /**
   * Maneja el cambio de usuario en el modal de crear
   */
  onUserForCreateChange() {
    // Cuando cambia el usuario, actualizar los checkboxes según los roles ya asignados
    this.selectedRolesForCreate.clear();
    if (this.selectedUserForCreate && this.userRoles[this.selectedUserForCreate]) {
      this.userRoles[this.selectedUserForCreate].forEach(role => {
        this.selectedRolesForCreate.add(role._id);
      });
    }
  }

  /**
   * Verifica si un rol está seleccionado para crear
   * @param roleId ID del rol
   * @returns true si está seleccionado
   */
  isRoleSelectedForCreate(roleId: string): boolean {
    return this.selectedRolesForCreate.has(roleId);
  }

  /**
   * Busca asignaciones por usuario
   */
  searchByUser() {
    if (this.selectedUserForSearch) {
      this.onSearchByUser.emit(this.selectedUserForSearch);
    }
  }

  /**
   * Busca asignaciones por rol
   */
  searchByRole() {
    if (this.selectedRoleForSearch) {
      this.onSearchByRole.emit(this.selectedRoleForSearch);
    }
  }

  /**
   * Maneja el clic en el backdrop del modal de crear para cerrarlo
   * @param event Evento del clic
   */
  onCreateBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeCreateModal();
    }
  }
}
