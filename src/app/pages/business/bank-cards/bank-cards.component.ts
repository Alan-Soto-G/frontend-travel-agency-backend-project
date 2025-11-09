import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { BankCard } from 'src/app/models/business-models/bank-card.model';
import { BankCardService } from 'src/app/services/models/business-models/bank-card.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

@Component({
  selector: 'app-bank-cards',
  imports: [TableCrudComponent],
  templateUrl: './bank-cards.component.html',
})
export class BankCardsComponent implements OnInit {
  bankCards: BankCard[] = [];

  headTable: string[] = [
    'ID',
    'Cliente ID',
    'Número de Tarjeta',
    'CVV',
    'Expiración',
    'Titular',
    'Actualizar',
    'Eliminar',
  ];

  itemsData: string[] = [
    'id',
    'client_id',
    'card_number',
    'cvv',
    'expiration_date',
    'card_holder_name',
  ];

  arrayFunctions: Record<string, Function>;

  fields: FormField[] = [
    { name: 'client_id', label: 'Cliente ID', type: 'number', required: true },
    {
      name: 'card_number',
      label: 'Número de Tarjeta',
      type: 'text',
      required: true,
      min: 16,
      max: 16,
    },
    { name: 'cvv', label: 'CVV', type: 'text', required: true, min: 3, max: 4 },
    { name: 'expiration_date', label: 'Fecha de Expiración', type: 'date', required: true },
    { name: 'card_holder_name', label: 'Titular', type: 'text', required: true, min: 3 },
  ];

  constructor(private bankCardService: BankCardService) {
    this.arrayFunctions = {
      update: (id?: string, card?: BankCard) => this.update(id, card),
      create: (card?: BankCard) => this.create(card),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.bankCardService.getBankCards().subscribe({
      next: (data) => (this.bankCards = data),
      error: (err) => console.error('Error al cargar tarjetas', err),
    });
  }

  findById(id: string): void {
    this.bankCardService.getBankCardById(id).subscribe({
      next: (data) => console.log('Tarjeta encontrada:', data),
      error: (err) => console.error('Error al buscar tarjeta', err),
    });
  }

  update(id?: string, card?: BankCard): void {
    if (id && card) {
      this.bankCardService.updateBankCard(id, card).subscribe({
        next: () => this.loadCards(),
        error: (err) => console.error('Error al actualizar tarjeta', err),
      });
    }
  }

  create(card?: BankCard): void {
    if (card) {
      this.bankCardService.createBankCard(card).subscribe({
        next: () => this.loadCards(),
        error: (err) => console.error('Error al crear tarjeta', err),
      });
    }
  }

  delete(id: string): void {
    this.bankCardService.deleteBankCard(id).subscribe({
      next: () => this.loadCards(),
      error: (err) => console.error('Error al eliminar tarjeta', err),
    });
  }
}
