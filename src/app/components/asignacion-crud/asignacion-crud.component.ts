import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-asignacion-crud',
  imports: [CommonModule],
  templateUrl: './asignacion-crud.component.html',
  styleUrl: './asignacion-crud.component.scss'
})
export class AsignacionCrudComponent {
  @Input() users: User[] = [];
  @Input() roles: Role[] = [];
  @Input() userRoles: Record<string, Role[]> = {};
  @Output() onRoleToggle = new EventEmitter<{user: User, role: Role, checked: boolean}>();

  selectedUser: User | null = null;
  showModal = false;

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
}
