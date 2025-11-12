import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormField } from '../../models/security-models/form-field.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * ModalCrudComponent
 *
 * Componente de modal reutilizable para operaciones CRUD.
 * Recibe campos, datos y tipo de acción por Input y emite eventos al componente padre.
 * Utiliza Angular Forms para validación y manejo de formularios.
 */
@Component({
  selector: 'app-modal-crud',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-crud.component.html',
  styleUrl: './modal-crud.component.scss'
})
export class ModalCrudComponent {
  /**
   * Referencia al formulario Angular para validación.
   */
  @ViewChild('crudForm') crudForm!: NgForm;
  /**
   * Referencia al elemento dialog del modal.
   */
  @ViewChild('modal') modalRef!: ElementRef<HTMLDialogElement>;

  /**
   * Título del modal.
   */
  @Input() title: string = '';
  /**
   * Mensaje del modal.
   */
  @Input() message: string = '';
  /**
   * Tipo de acción ('create', 'edit', 'delete').
   */
  @Input() typeService: string = '';
  /**
   * Texto del botón principal del modal.
   */
  @Input() textButton: string = '';
  /**
   * Definición de los campos del formulario.
   */
  @Input() fields: FormField[] = [];
  /**
   * Datos del formulario (para crear/editar).
   */
  @Input() formData: any = {};

  /**
   * Evento emitido al enviar el formulario (create, edit, delete).
   */
  @Output() formSubmitted = new EventEmitter<any>();
  /**
   * Evento emitido al cerrar el modal.
   */
  @Output() modalClose = new EventEmitter<void>();

  /**
   * Abre el modal y aplica la animación de apertura.
   */
  openModal() {
    const modal = this.modalRef.nativeElement;
    modal.showModal();
    requestAnimationFrame(() => {
      modal.classList.add('opening');
    });
  }

  /**
   * Maneja el envío del formulario.
   * Si es delete, emite el evento directamente.
   * Si es create/edit, valida el formulario antes de emitir el evento.
   */
  onSubmit() {
    if (this.typeService === 'delete') {
      this.formSubmitted.emit({ action: 'delete', data: null });
      this.closeModal();
      return;
    }

    if (this.crudForm.valid) {
      this.formSubmitted.emit({
        action: this.typeService,
        data: this.formData
      });
      this.closeModal();
    } else {
      this.crudForm.form.markAllAsTouched();
    }
  }

  /**
   * Cierra el modal y emite el evento de cierre.
   */
  closeModal() {
    const modal = this.modalRef.nativeElement;
    modal.classList.remove('opening');
    modal.classList.add('closing');

    const onTransitionEnd = () => {
      modal.classList.remove('closing');
      modal.close();
      this.modalClose.emit();
      modal.removeEventListener('transitionend', onTransitionEnd);
    };
    modal.addEventListener('transitionend', onTransitionEnd);
  }
}
