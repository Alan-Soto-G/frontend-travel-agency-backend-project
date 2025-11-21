import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Client } from 'src/app/models/business-models/client.model';
import { ClientService } from 'src/app/services/models/business-models/client.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { forkJoin } from 'rxjs';

/**
 * ClientsComponent
 *
 * Componente de página para la gestión de clientes (Clients).
 * Utiliza el servicio ClientService para operaciones CRUD.
 */
@Component({
  selector: 'app-clients',
  imports: [TableCrudComponent],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  /**
   * Lista de clientes cargados desde el backend.
   */
  clients: Client[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Usuario ID',
    'Contacto Emergencia',
    'Teléfono Emergencia',
    'Alergias',
    'Puntos Lealtad',
    'VIP',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'userId',
    'emergencyContactName',
    'emergencyContactPhone',
    'allergies',
    'loyaltyPoints',
    'isVip',
  ];

  /**
   * Diccionario de funciones CRUD para pasar al componente de tabla.
   */
  arrayFunctions: Record<string, Function>;

  /**
   * Definición de los campos del formulario para el modal CRUD.
   */
  fields: FormField[] = [];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param clientService Servicio para gestionar los clientes
   */
  constructor(private clientService: ClientService) {
    this.arrayFunctions = {
      update: (id?: string, client?: Client) => this.update(id, client),
      create: (client?: Client) => this.create(client),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de los clientes al montar el componente.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos iniciales necesarios en paralelo.
   */
  loadInitialData(): void {
    forkJoin({
      clients: this.clientService.getClients()
    }).subscribe({
      next: (results: any) => {
        this.clients = results.clients.data;
        
        console.log('Clientes cargados:', this.clients.length, 'registros');

        // Definir los campos del formulario
        this.fields = [
          {
            name: 'userId',
            label: 'Usuario ID',
            type: 'text',
            placeholder: 'Ingrese el ID del usuario',
            required: true,
            minLength: 1,
            maxLength: 100,
          },
          {
            name: 'emergencyContactName',
            label: 'Nombre de Contacto de Emergencia',
            type: 'text',
            placeholder: 'Ingrese el nombre del contacto de emergencia',
            required: false,
            minLength: 3,
            maxLength: 100,
          },
          {
            name: 'emergencyContactPhone',
            label: 'Teléfono de Emergencia',
            type: 'text',
            placeholder: 'Ingrese el teléfono de emergencia',
            required: false,
            minLength: 7,
            maxLength: 20
          },
          {
            name: 'allergies',
            label: 'Alergias',
            type: 'text',
            placeholder: 'Ingrese las alergias del cliente (opcional)',
            required: false,
            maxLength: 500
          },
          {
            name: 'loyaltyPoints',
            label: 'Puntos de Lealtad',
            type: 'number',
            placeholder: 'Ingrese los puntos de lealtad',
            required: false,
            min: 0,
          },
          {
            name: 'isVip',
            label: '¿Es VIP?',
            type: 'select',
            placeholder: 'Seleccione si es VIP',
            required: false,
            options: [
              { value: true, label: '⭐ Sí' },
              { value: false, label: '👤 No' }
            ]
          },
        ];

        console.log('Campos del formulario configurados:', this.fields);
      },
      error: (err) => console.error('Error al cargar datos iniciales', err),
    });
  }

  /**
   * Recarga solo la lista de clientes.
   */
  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (res: any) => {
        this.clients = res.data;
        console.log('Clientes actualizados:', this.clients.length, 'registros');
      },
      error: (err) => console.error('Error al cargar clientes', err),
    });
  }

  /**
   * Busca un cliente por ID.
   * @param id ID del cliente
   */
  findById(id: string): void {
    this.clientService.getClientById(id).subscribe({
      next: (data) => console.log('Cliente encontrado:', data),
      error: (err) => console.error('Error al buscar cliente', err),
    });
  }

  /**
   * Actualiza un cliente.
   * @param id ID del cliente
   * @param client Datos actualizados
   */
  update(id?: string, client?: Client): void {
    if (id && client) {
      this.clientService.updateClient(id, client).subscribe({
        next: () => {
          console.log('Cliente actualizado exitosamente');
          this.loadClients();
        },
        error: (err) => console.error('Error al actualizar cliente', err),
      });
    }
  }

  /**
   * Crea un nuevo cliente.
   * @param client Datos del nuevo cliente
   */
  create(client?: Client): void {
    if (client) {
      this.clientService.createClient(client).subscribe({
        next: () => {
          console.log('Cliente creado exitosamente');
          this.loadClients();
        },
        error: (err) => console.error('Error al crear cliente', err),
      });
    }
  }

  /**
   * Elimina un cliente.
   * @param id ID del cliente a eliminar
   */
  delete(id: string): void {
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        console.log('Cliente eliminado exitosamente');
        this.loadClients();
      },
      error: (err) => console.error('Error al eliminar cliente', err),
    });
  }
}