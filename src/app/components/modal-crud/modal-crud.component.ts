import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { FormField } from '../../models/security-models/form-field.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-crud',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-crud.component.html',
  styleUrl: './modal-crud.component.scss'
})
export class ModalCrudComponent {
  @ViewChild('crudForm') crudForm!: NgForm;
  @ViewChild('modal') modalRef!: ElementRef<HTMLDialogElement>;

  @Input() title: string = '';
  @Input() message: string = '';
  @Input() typeService: string = '';
  @Input() textButton: string = '';
  @Input() fields: FormField[] = [];
  @Input() formData: any = {};

  @Output() formSubmitted = new EventEmitter<any>();
  @Output() modalClose = new EventEmitter<void>();

  openModal() {
    const modal = this.modalRef.nativeElement;
    modal.showModal();
    requestAnimationFrame(() => {
      modal.classList.add('opening');
    });
  }

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