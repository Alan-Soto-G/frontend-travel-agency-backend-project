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
  @Input() isSearchMode: boolean = false; // Para saber si estamos en modo búsqueda
  @Input() searchType: string = ''; // 'user' o 'role' para saber qué tipo de búsqueda
  @Output() onRoleToggle = new EventEmitter<{user: User, role: Role, checked: boolean}>();
  @Output() onListAll = new EventEmitter<void>(); // Cambio de onCreateAssignment a onListAll
  @Output() onSearchByUser = new EventEmitter<string>();
  @Output() onSearchByRole = new EventEmitter<string>();

  selectedUser: User | null = null;
  showModal = false;

  // Variables para búsquedas
  selectedUserForSearch: string = '';
  selectedRoleForSearch: string = '';
  private lastSearchedUserId: string = ''; // Para evitar búsquedas duplicadas
  private lastSearchedRoleId: string = ''; // Para evitar búsquedas duplicadas

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
   * Busca asignaciones por usuario
   */
  searchByUser() {
    if (this.selectedUserForSearch && this.selectedUserForSearch !== this.lastSearchedUserId) {
      this.lastSearchedUserId = this.selectedUserForSearch;
      this.onSearchByUser.emit(this.selectedUserForSearch);
      // Limpiar formularios después de buscar
      this.selectedUserForSearch = '';
      this.selectedRoleForSearch = '';
      this.lastSearchedRoleId = '';
    }
  }

  /**
   * Busca asignaciones por rol
   */
  searchByRole() {
    if (this.selectedRoleForSearch && this.selectedRoleForSearch !== this.lastSearchedRoleId) {
      this.lastSearchedRoleId = this.selectedRoleForSearch;
      this.onSearchByRole.emit(this.selectedRoleForSearch);
      // Limpiar formularios después de buscar
      this.selectedUserForSearch = '';
      this.selectedRoleForSearch = '';
      this.lastSearchedUserId = '';
    }
  }

  /**
   * Maneja el clic en acciones (listar todo)
   * @param action Acción a realizar
   */
  handleActionClick(action: string) {
    if (action === 'listAll') {
      // Limpiar formularios y variables de control
      this.selectedUserForSearch = '';
      this.selectedRoleForSearch = '';
      this.lastSearchedUserId = '';
      this.lastSearchedRoleId = '';
      this.onListAll.emit();
    }
  }

  /**
   * Verifica si debe mostrar el mensaje de "Nadie posee este rol"
   */
  shouldShowNoRoleMessage(): boolean {
    return this.isSearchMode && this.searchType === 'role' && this.users.length === 0;
  }

  /**
   * Verifica si debe mostrar la fila de usuario sin roles
   */
  shouldShowUserWithoutRoles(): boolean {
    return this.isSearchMode && this.searchType === 'user' && this.users.length === 0;
  }

  /**
   * Obtiene el usuario buscado (para mostrar sin roles si no tiene asignaciones)
   */
  getSearchedUser(): User | null {
    if (this.shouldShowUserWithoutRoles() && this.selectedUserForSearch) {
      return this.allUsers.find(u => u._id === this.selectedUserForSearch) || null;
    }
    return null;
  }
}
