import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Room } from 'src/app/models/business-models/room.model';
import { RoomService } from 'src/app/services/models/business-models/room.service';
import { FormField } from 'src/app/models/security-models/form-field.component';

/**
 * RoomsComponent
 *
 * Componente de página para la gestión de habitaciones de hotel (Rooms).
 * Permite crear, listar, actualizar y eliminar habitaciones.
 *
 * Utiliza el servicio RoomService para operaciones CRUD.
 */
@Component({
  selector: 'app-rooms',
  imports: [TableCrudComponent],
  templateUrl: './rooms.component.html',
})
export class RoomsComponent implements OnInit {
  /**
   * Lista de habitaciones cargadas desde el backend.
   */
  rooms: Room[] = [];

  /**
   * Encabezados de la tabla.
   */
  headTable: string[] = [
    'ID',
    'Hotel ID',
    'Número Habitación',
    'Tipo',
    'Capacidad',
    'Precio/Noche',
    'Estado',
    'Actualizar',
    'Eliminar',
  ];

  /**
   * Campos de los datos a mostrar en la tabla.
   */
  itemsData: string[] = [
    'id',
    'hotelId',
    'roomNumber',
    'roomType',
    'capacity',
    'pricePerNight',
    'status',
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
      name: 'hotelId',
      label: 'Hotel ID',
      type: 'number',
      placeholder: 'Ingrese el ID del hotel',
      required: true
    },
    {
      name: 'roomNumber',
      label: 'Número de Habitación',
      type: 'text',
      placeholder: 'Ingrese el número de habitación',
      required: true,
      min: 1,
      max: 20,
    },
    {
      name: 'roomType',
      label: 'Tipo de Habitación',
      type: 'text',
      placeholder: 'Ej: Suite, Doble, Individual',
      required: true,
      min: 3,
      max: 50
    },
    {
      name: 'capacity',
      label: 'Capacidad',
      type: 'number',
      placeholder: 'Número de personas (1-20)',
      required: true,
      min: 1,
      max: 20
    },
    {
      name: 'pricePerNight',
      label: 'Precio por Noche',
      type: 'number',
      placeholder: 'Ingrese el precio por noche',
      required: true,
      min: 0
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Seleccione el estado',
      required: false,
      options: [
        { value: 'available', text: 'Disponible' },
        { value: 'occupied', text: 'Ocupada' },
        { value: 'maintenance', text: 'Mantenimiento' },
        { value: 'cleaning', text: 'Limpieza' }
      ]
    },
  ];

  /**
   * Constructor: inicializa el servicio y las funciones CRUD.
   * @param roomService Servicio para gestionar las habitaciones
   */
  constructor(private roomService: RoomService) {
    this.arrayFunctions = {
      update: (id?: string, room?: Room) => this.update(id, room),
      create: (room?: Room) => this.create(room),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
    };
  }

  /**
   * Carga inicial de las habitaciones al montar el componente.
   */
  ngOnInit(): void {
    this.loadRooms();
  }

  /**
   * Carga la lista de habitaciones desde el backend.
   */
  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (res: any) => {
        this.rooms = res.data;
        console.log('Habitaciones cargadas:', this.rooms.length, 'registros');
      },
      error: (err) => console.error('Error al cargar habitaciones', err),
    });
  }

  /**
   * Busca una habitación por ID.
   * @param id ID de la habitación
   */
  findById(id: string): void {
    this.roomService.getRoomById(id).subscribe({
      next: (data) => console.log('Habitación encontrada:', data),
      error: (err) => console.error('Error al buscar habitación', err),
    });
  }

  /**
   * Actualiza una habitación.
   * @param id ID de la habitación
   * @param room Datos actualizados
   */
  update(id?: string, room?: Room): void {
    if (id && room) {
      this.roomService.updateRoom(id, room).subscribe({
        next: () => this.loadRooms(),
        error: (err) => console.error('Error al actualizar habitación', err),
      });
    }
  }

  /**
   * Crea una nueva habitación.
   * @param room Datos de la nueva habitación
   */
  create(room?: Room): void {
    if (room) {
      this.roomService.createRoom(room).subscribe({
        next: () => this.loadRooms(),
        error: (err) => console.error('Error al crear habitación', err),
      });
    }
  }

  /**
   * Elimina una habitación.
   * @param id ID de la habitación a eliminar
   */
  delete(id: string): void {
    this.roomService.deleteRoom(id).subscribe({
      next: () => this.loadRooms(),
      error: (err) => console.error('Error al eliminar habitación', err),
    });
  }
}

