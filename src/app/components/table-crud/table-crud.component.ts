import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalCrudComponent } from '../modal-crud/modal-crud.component';
import { FormField } from '../../models/security-models/form-field.component';

/**
 * TableCrudComponent
 *
 * Componente genérico de tabla CRUD reutilizable con:
 * - Búsqueda en tiempo real
 * - Paginación (10 registros por página)
 * - Diseño completamente responsive
 */
@Component({
  selector: 'app-table-crud',
  standalone: true,
  imports: [CommonModule, ModalCrudComponent, FormsModule],
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

  // Propiedades para búsqueda y paginación
  searchText: string = '';
  filteredData: Array<any> = [];
  paginatedData: Array<any> = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Hacer Math disponible en el template
  Math = Math;

  /**
   * Cuando cambia la data de entrada, actualizar filtros y paginación
   */
  ngOnChanges(): void {
    this.applyFilters();
  }

  /**
   * Aplica el filtro de búsqueda y actualiza la paginación
   */
  applyFilters(): void {
    // Si no hay texto de búsqueda, mostrar todos los datos
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredData = [...this.data];
    } else {
      // Filtrar datos según el texto de búsqueda
      const searchLower = this.searchText.toLowerCase();
      this.filteredData = this.data.filter(item => {
        // Buscar en todos los campos configurados
        return this.itemsData.some(field => {
          const value = this.getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Reiniciar a la primera página cuando se filtra
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Actualiza la paginación según los datos filtrados
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  /**
   * Cambia a la página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * Cambia a la página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * Va a una página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /**
   * Genera un array de números de página para mostrar
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (this.currentPage <= 3) {
        endPage = maxPagesToShow;
      }
      if (this.currentPage >= this.totalPages - 2) {
        startPage = this.totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Maneja el cambio en el input de búsqueda
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Obtiene el valor de una propiedad anidada de un objeto
   * @param obj Objeto del cual obtener el valor
   * @param path Ruta de la propiedad (ej: 'user.name')
   * @returns El valor de la propiedad
   */
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) =>
      current ? current[key] : undefined, obj);
  }

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
        // Soporte para MongoDB (_id) y PostgreSQL (id)
        this.formDataModal = {...this.data.find(item => item._id === id || item.id === id)} || {};
        // Eliminar el campo password para que se muestre vacío en modo edición
        if (this.formDataModal.password !== undefined) {
          delete this.formDataModal.password;
        }
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
    /**
   * Indica si se debe mostrar el botón de carrito (opcional)
   */
  @Input() showCartButton: boolean = false;

  /**
   * Maneja el click en el botón de agregar al carrito
   * @param item El item a agregar al carrito
   */
  handleCartClick(item: any): void {
    if (this.arrayFuctions && this.arrayFuctions['addToCart']) {
      this.arrayFuctions['addToCart'](item);
    } else {
      console.warn('La función addToCart no está definida en arrayFuctions');
    }
  }
}
