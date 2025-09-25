import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCrudComponent } from '../modal-crud/modal-crud.component';
import { FormField } from '../../models/form-field.component';

/**
 * TableCrudComponent
 *
 * Componente genérico de tabla CRUD reutilizable.
 * Recibe datos, encabezados, campos y funciones por Input y maneja la interacción con el modal CRUD.
 */
@Component({
  selector: 'app-table-crud',
  standalone: true,
  imports: [CommonModule, ModalCrudComponent],
  templateUrl: './table-crud.component.html',
  styleUrls: ['./table-crud.component.scss']
})
export class TableCrudComponent {
  /**
   * Encabezados de la tabla.
   */
  @Input() headTable: string[] = [];
  /**
   * Nombre de la entidad para el CRUD (ej: 'usuarios').
   */
  @Input() typeOfCrud: string = '';
  /**
   * Campos de los datos a mostrar en la tabla.
   */
  @Input() itemsData: string[] = [];
  /**
   * Datos a mostrar en la tabla.
   */
  @Input() data: Array<any> = [];
  /**
   * Longitud para recortar el nombre de la entidad (para singular/plural).
   */
  @Input() lenSlice: number = 0;
  /**
   * Diccionario de funciones CRUD a ejecutar desde la tabla.
   */
  @Input() arrayFuctions: Record<string, Function>

  /**
   * Referencia al componente ModalCrudComponent para abrir/cerrar el modal.
   */
  @ViewChild(ModalCrudComponent) modalComponent!: ModalCrudComponent;

  /**
   * Título del modal.
   */
  titleModal: string = '';
  /**
   * Mensaje del modal.
   */
  messageModal: string = '';
  /**
   * Tipo de acción del modal ('create', 'edit', 'delete').
   */
  typeServiceModal: string = '';
  /**
   * Texto del botón principal del modal.
   */
  textButtonModal: string = '';
  /**
   * Datos del formulario a pasar al modal.
   */
  formDataModal: any = {};
  /**
   * ID del elemento actual seleccionado para editar/eliminar.
   */
  currentItemId: string | null = null;
  /**
   * Definición de los campos del formulario para el modal.
   */
  @Input() fields: FormField[] = [];

  /**
   * Maneja el click en las acciones de la tabla (crear, editar, eliminar).
   * Prepara los datos y abre el modal correspondiente.
   * @param action Acción a ejecutar ('create', 'edit', 'delete')
   * @param id ID del elemento (opcional)
   */
  handleActionClick(action: 'create' | 'edit' | 'delete', id?: string) {
    this.currentItemId = id || null;
    switch (action) {
      case 'create':
        this.titleModal = 'Crear ' + this.typeOfCrud.slice(0, -this.lenSlice);
        this.messageModal = '';
        this.textButtonModal = 'Crear ➕';
        this.formDataModal = {}; // Reset form data for creation
        break;
      case 'edit':
        this.titleModal = 'Editar ' + this.typeOfCrud.slice(0, -this.lenSlice);
        this.messageModal = '';
        this.textButtonModal = 'Guardar 💾';
        // @ts-ignore
        this.formDataModal = {...this.data.find(item => item._id === id)} || {};
        break;
      case 'delete':
        this.titleModal = 'Eliminar ' + this.typeOfCrud.slice(0, -this.lenSlice);
        this.messageModal = `¿Estás seguro de que deseas eliminar el ${this.typeOfCrud.slice(0, -this.lenSlice)} con ID ?`;
        this.textButtonModal = 'Eliminar 🗑️';
        break;
    }
    this.typeServiceModal = action;
    this.modalComponent?.openModal();
  }

  /**
   * Recibe el evento del modal con la acción y los datos, y ejecuta la función correspondiente.
   * @param event Objeto con la acción ('create', 'edit', 'delete') y los datos del formulario
   */
  onFormSubmitted(event: { action: string, data: any }) {
    switch (event.action) {
      case 'create':
        this.arrayFuctions['create'](event.data);
        break;
      case 'edit':
        this.arrayFuctions['update'](this.currentItemId, event.data);
        break;
      case 'delete':
        this.arrayFuctions['delete'](this.currentItemId);
        break;
    }
  }
}
