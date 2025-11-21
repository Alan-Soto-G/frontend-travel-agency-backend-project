import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { BankCard } from 'src/app/models/business-models/bank-card.model';
import { BankCardService } from 'src/app/services/models/business-models/bank-card.service';
import { ClientService } from 'src/app/services/models/business-models/client.service';
import { UserService } from 'src/app/services/models/security-models/user.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

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
   * ⚠️ NOTA: CVV removido de la tabla por seguridad
   */
  headTable: string[] = [
    'ID',
    'Cliente',
    'Email/Usuario',
    'Número de Tarjeta',
    'Expiración',
    'Titular',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   * ⚠️ RECOMENDACIÓN: Implementa un pipe para enmascarar cardNumber (mostrar solo últimos 4 dígitos)
   */
  itemsData: string[] = [
    'id',
    'clientName',           // Mostrar nombre del cliente
    'clientEmail',          // Mostrar email del usuario
    'cardNumber',           // TODO: Implementar pipe para enmascarar (****1234)
    'expirationDate',
    'cardHolderName',
  ];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   * Se inicializa vacío y se llena dinámicamente en ngOnInit.
   */
  fields: FormField[] = [];

  /**
   * Cache de datos relacionados
   */
  private usersCache: any[] = [];
  private clientsCache: any[] = [];

  /**
   * Constructor: inicializa los servicios y las funciones CRUD.
   * @param bankCardService Servicio para gestionar las tarjetas bancarias
   * @param clientService Servicio para obtener los clientes
   * @param userService Servicio para obtener los usuarios
   */
  constructor(
    private bankCardService: BankCardService,
    private clientService: ClientService,
    private userService: UserService
  ) {
    this.arrayFunctions = {
      update: (id?: string, card?: BankCard) => this.update(id, card),
      create: (card?: BankCard) => this.create(card),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial: obtiene tarjetas bancarias, clientes y usuarios.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      bankCards: this.bankCardService.getBankCards(),
      clients: this.clientService.getClients(),
      users: this.userService.getUsers()
    }).subscribe({
      next: (results: any) => {
        console.log('Resultados cargados:', results);

        // Guardar en cache con validación
        this.usersCache = results.users?.data || results.users || [];
        this.clientsCache = results.clients?.data || results.clients || [];

        console.log('Resultados cargados:', results);

        // Guardar en cache con validación
        this.usersCache = results.users?.data || results.users || [];
        this.clientsCache = results.clients?.data || results.clients || [];

        console.log('Users cache:', this.usersCache);
        console.log('Clients cache:', this.clientsCache);

        // Crear mapas para búsqueda rápida (usando _id o id según lo que venga)
        const usersMap = new Map(
          this.usersCache.map((user: any) => [user._id || user.id, user])
        );
        const clientsMap = new Map(
          this.clientsCache.map((client: any) => [client._id || client.id, client])
        );

        // Enriquecer tarjetas con datos del cliente y usuario
        const bankCardsData = results.bankCards?.data || results.bankCards || [];
        this.bankCards = bankCardsData.map((card: any) => {
          const client = clientsMap.get(card.clientId);
          const user = client ? usersMap.get(client.userId) : null;
          
          return {
            ...card,
            id: card._id || card.id,  // Normalizar el ID
            clientName: user?.name || 'Sin nombre',
            clientEmail: user?.email || client?.userId || 'N/A'
          };
        });
        
        console.log('Tarjetas cargadas:', this.bankCards.length, 'registros');

        // Construir opciones para el select de clientes
        const clientOptions = this.clientsCache.map((client: any) => {
          const user = usersMap.get(client.userId);
          
          return {
            value: client._id || client.id,
            label: `👤 ${user?.name || 'Sin nombre'} - ${user?.email || client.userId} (Cliente ID: ${client._id || client.id})`
          };
        });

        // Definir los campos del formulario con las opciones cargadas
        this.fields = [
          { 
            name: 'clientId',
            label: 'Cliente', 
            type: 'select',
            placeholder: 'Seleccione un cliente',
            required: true,
            options: clientOptions
          },
          {
            name: 'cardNumber',
            label: 'Número de Tarjeta',
            type: 'text',
            placeholder: 'Ingrese el número de tarjeta (13-19 dígitos)',
            required: true,
            minLength: 13,
            maxLength: 19,
            pattern: '^[0-9]{13,19}$'
          },
          { 
            name: 'cvv', 
            label: 'CVV', 
            type: 'password',
            placeholder: 'Ingrese el CVV (3-4 dígitos)',
            required: true, 
            minLength: 3,
            maxLength: 4,
            pattern: '^[0-9]{3,4}$'
          },
          { 
            name: 'expirationDate',
            label: 'Fecha de Expiración', 
            type: 'date', 
            placeholder: 'Seleccione la fecha de expiración',
            required: true 
          },
          { 
            name: 'cardHolderName',
            label: 'Nombre del Titular', 
            type: 'text', 
            placeholder: 'Ingrese el nombre del titular',
            required: true, 
            minLength: 3,
            maxLength: 255,
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de tarjetas (con enriquecimiento de datos).
   * ⚠️ SEGURIDAD: El backend debería enmascarar datos sensibles
   */
  loadCards(): void {
    this.bankCardService.getBankCards().subscribe({
      next: (res: any) => {
        // Crear mapas para búsqueda rápida (usando _id o id)
        const usersMap = new Map(
          this.usersCache.map((user: any) => [user._id || user.id, user])
        );
        const clientsMap = new Map(
          this.clientsCache.map((client: any) => [client._id || client.id, client])
        );

        // Enriquecer tarjetas con datos del cliente y usuario
        const bankCardsData = res.data || res || [];
        this.bankCards = bankCardsData.map((card: any) => {
          const client = clientsMap.get(card.clientId);
          const user = client ? usersMap.get(client.userId) : null;
          
          return {
            ...card,
            id: card._id || card.id,  // Normalizar el ID
            clientName: user?.name || 'Sin nombre',
            clientEmail: user?.email || client?.userId || 'N/A'
          };
        });

        console.log('Tarjetas actualizadas:', this.bankCards.length, 'registros');
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
        next: () => {
          console.log('Tarjeta actualizada exitosamente');
          this.loadCards();
        },
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
        next: () => {
          console.log('Tarjeta creada exitosamente');
          this.loadCards();
        },
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
      next: () => {
        console.log('Tarjeta eliminada exitosamente');
        this.loadCards();
      },
      error: (err) => console.error('Error al eliminar tarjeta', err),
    });
  }
}