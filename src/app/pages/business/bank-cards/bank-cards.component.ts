import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { BankCard } from 'src/app/models/business-models/bank-card.model';
import { BankCardService } from 'src/app/services/models/business-models/bank-card.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * BankCardsComponent
 *
 * Componente de página para la gestión de tarjetas bancarias (BankCards).
 * ⚠️ IMPORTANTE: Maneja información sensible. Se recomienda:
 * - Encriptar datos en tránsito (HTTPS)
 * - Enmascarar números de tarjeta en la tabla
 * - No mostrar CVV en listados
 * - Cumplir con PCI DSS si se procesan pagos reales
 * 
 * Utiliza el servicio BankCardService para operaciones CRUD.
 */
@Component({
  selector: 'app-bank-cards',
  imports: [TableCrudComponent],
  templateUrl: './bank-cards.component.html',
})
export class BankCardsComponent implements OnInit {
  /**
   * Lista de tarjetas bancarias cargadas desde el backend.
   */
  bankCards: BankCard[] = [];

  /**
   * Encabezados de la tabla.
   * ⚠️ NOTA: Considera ocultar CVV de la tabla por seguridad
   */
  headTable: string[] = [
    'ID',
    'Cliente ID',
    'Número de Tarjeta',
    'CVV',  // ⚠️ Considera remover esto por seguridad
    'Expiración',
    'Titular',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   * ⚠️ RECOMENDACIÓN: Usa un pipe para enmascarar cardNumber (mostrar solo últimos 4 dígitos)
   */
  itemsData: string[] = [
    'id',
    'clientId',         // ✅ Cambiado de client_id a clientId (camelCase)
    'cardNumber',       // ✅ Cambiado de card_number a cardNumber
    'cvv',              // ⚠️ Considera remover por seguridad
    'expirationDate',   // ✅ Cambiado de expiration_date a expirationDate
    'cardHolderName',   // ✅ Cambiado de card_holder_name a cardHolderName
  ];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [
    { 
      name: 'clientId',    // ✅ Cambiado a camelCase
      label: 'Cliente ID', 
      type: 'number', 
      placeholder: 'Ingrese el ID del cliente',
      required: true 
    },
    {
      name: 'cardNumber',  // ✅ Cambiado a camelCase
      label: 'Número de Tarjeta',
      type: 'text',
      placeholder: 'Ingrese el número de tarjeta (13-19 dígitos)',
      required: true,
      min: 13,           // ✅ Cambiado a 13 (min para tarjetas)
      max: 19,           // ✅ Cambiado a 19 (max para tarjetas)
    },
    { 
      name: 'cvv', 
      label: 'CVV', 
      type: 'password',  // ✅ Cambiado a password para mayor seguridad
      placeholder: 'Ingrese el CVV (3-4 dígitos)',
      required: true, 
      min: 3, 
      max: 4 
    },
    { 
      name: 'expirationDate',  // ✅ Cambiado a camelCase
      label: 'Fecha de Expiración', 
      type: 'date', 
      placeholder: 'Seleccione la fecha de expiración',
      required: true 
    },
    { 
      name: 'cardHolderName',  // ✅ Cambiado a camelCase
      label: 'Nombre del Titular', 
      type: 'text', 
      placeholder: 'Ingrese el nombre del titular',
      required: true, 
      min: 3,
      max: 255,
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param bankCardService Servicio para gestionar las tarjetas bancarias
   */
  constructor(private bankCardService: BankCardService) {
    this.arrayFunctions = {
      update: (id?: string, card?: BankCard) => this.update(id, card),
      create: (card?: BankCard) => this.create(card),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de las tarjetas al montar el componente.
   */
  ngOnInit(): void {
    this.loadCards();
  }

  /**
   * Carga la lista de tarjetas desde el backend.
   * ⚠️ SEGURIDAD: El backend debería enmascarar datos sensibles
   */
  loadCards(): void {
    this.bankCardService.getBankCards().subscribe({
      next: (res: any) => {
        this.bankCards = res.data;  // ✅ Extraer solo el array de data
        console.log('Tarjetas cargadas:', this.bankCards.length, 'registros'); // ✅ Log seguro
      },
      error: (err) => console.error('Error al cargar tarjetas', err),
    });
  }

  /**
   * Busca una tarjeta por ID.
   * @param id ID de la tarjeta
   */
  findById(id: string): void {
    this.bankCardService.getBankCardById(id).subscribe({
      next: (data) => console.log('Tarjeta encontrada:', data),
      error: (err) => console.error('Error al buscar tarjeta', err),
    });
  }

  /**
   * Actualiza una tarjeta.
   * @param id ID de la tarjeta
   * @param card Datos actualizados
   */
  update(id?: string, card?: BankCard): void {
    if (id && card) {
      this.bankCardService.updateBankCard(id, card).subscribe({
        next: () => this.loadCards(),
        error: (err) => console.error('Error al actualizar tarjeta', err),
      });
    }
  }

  /**
   * Crea una nueva tarjeta.
   * @param card Datos de la nueva tarjeta
   */
  create(card?: BankCard): void {
    if (card) {
      this.bankCardService.createBankCard(card).subscribe({
        next: () => this.loadCards(),
        error: (err) => console.error('Error al crear tarjeta', err),
      });
    }
  }

  /**
   * Elimina una tarjeta.
   * @param id ID de la tarjeta a eliminar
   */
  delete(id: string): void {
    this.bankCardService.deleteBankCard(id).subscribe({
      next: () => this.loadCards(),
      error: (err) => console.error('Error al eliminar tarjeta', err),
    });
  }
}