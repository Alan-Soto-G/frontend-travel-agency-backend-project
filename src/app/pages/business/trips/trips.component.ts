import { Component, OnInit } from '@angular/core';
import { TableCrudComponent } from 'src/app/components/table-crud/table-crud.component';
import { Trip } from 'src/app/models/business-models/trip.model';
import { TripService } from 'src/app/services/models/business-models/trip.service';
import { FormField } from 'src/app/models/security-models/form-field.component';
import { CartService } from 'src/app/services/cart/cart.service';
import { TripClientService } from 'src/app/services/models/business-models/trip-client.service';
import { ClientService } from 'src/app/services/models/business-models/client.service'; // ✅ IMPORTAR
import { TripClient } from 'src/app/models/business-models/trip-client.model';

@Component({
  selector: 'app-trips',
  imports: [TableCrudComponent],
  templateUrl: './trips.component.html',
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  private clientId: number | null = null;

  headTable: string[] = [
    'ID',
    'Nombre',
    'Destino',
    'Precio',
    'Capacidad',
    'Disponibles',
    'Estado',
    'Fecha Inicio',
    'Fecha Fin',
    'Actualizar',
    'Eliminar'
  ];

  itemsData: string[] = [
    'id',
    'name',
    'destination',
    'price',
    'capacity',
    'availableSeats',
    'status',
    'startDate',
    'endDate'
  ];

  arrayFunctions: Record<string, Function>;

  fields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre del Viaje',
      type: 'text',
      placeholder: 'Ingrese el nombre del viaje',
      required: true,
      min: 3,
      max: 255,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Ingrese una descripción (opcional)',
      required: false,
      max: 500,
    },
    {
      name: 'destination',
      label: 'Destino',
      type: 'text',
      placeholder: 'Ingrese el destino del viaje',
      required: true,
      min: 3,
      max: 100,
    },
    {
      name: 'startDate',
      label: 'Fecha de Inicio',
      type: 'date',
      placeholder: 'Seleccione la fecha de inicio',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Fecha de Fin',
      type: 'date',
      placeholder: 'Seleccione la fecha de fin',
      required: true,
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'number',
      placeholder: 'Ingrese el precio del viaje',
      required: true,
    },
    {
      name: 'capacity',
      label: 'Capacidad',
      type: 'number',
      placeholder: 'Ingrese la capacidad total',
      required: true,
    },
    {
      name: 'availableSeats',
      label: 'Cupos Disponibles',
      type: 'number',
      placeholder: 'Ingrese los cupos disponibles',
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Borrador', value: 'draft' },
        { label: 'Publicado', value: 'published' },
        { label: 'Activo', value: 'active' },
        { label: 'Lleno', value: 'full' },
        { label: 'Completado', value: 'completed' },
        { label: 'Cancelado', value: 'cancelled' }
      ],
      required: true,
    },
  ];

  constructor(
    private tripService: TripService,
    private cartService: CartService,
    private tripClientService: TripClientService,
    private clientService: ClientService // ✅ INYECTAR ClientService
  ) {
    this.arrayFunctions = {
      update: (id?: string, trip?: Trip) => this.update(id, trip),
      create: (trip?: Trip) => this.create(trip),
      findById: (id: string) => this.findById(id),
      delete: (id: string) => this.delete(id),
      addToCart: (trip: Trip) => this.addToCart(trip),
    };
  }

  ngOnInit(): void {
    this.loadTrips();
    this.loadClientId();
  }

  loadTrips(): void {
    this.tripService.getTrips().subscribe({
      next: (res: any) => {
        this.trips = res.data;
        console.log('Viajes cargados:', this.trips);
      },
      error: (err) => console.error('Error al cargar viajes', err),
    });
  }

  /**
   * ✅ CORREGIDO: Usar ClientService.getClientIdByUser()
   */
  private loadClientId(): void {
    this.clientService.getClientIdByUser().subscribe({
      next: (response) => {
        if (response.data && response.data.clientId) {
          this.clientId = response.data.clientId;
          console.log('✅ Client ID obtenido:', this.clientId);
        } else {
          console.log('ℹ️ Usuario no es cliente');
          this.clientId = null;
        }
      },
      error: (err) => {
        console.log('ℹ️ Error al obtener clientId:', err);
        this.clientId = null;
      }
    });
  }

  findById(id: string): void {
    this.tripService.getTripById(id).subscribe({
      next: (data) => console.log('Viaje encontrado:', data),
      error: (err) => console.error('Error al buscar viaje', err),
    });
  }

  update(id?: string, trip?: Trip): void {
    if (id && trip) {
      this.tripService.updateTrip(id, trip).subscribe({
        next: () => this.loadTrips(),
        error: (err) => console.error('Error al actualizar viaje', err),
      });
    }
  }

  create(trip?: Trip): void {
    if (trip) {
      this.tripService.createTrip(trip).subscribe({
        next: () => this.loadTrips(),
        error: (err) => console.error('Error al crear viaje', err),
      });
    }
  }

  delete(id: string): void {
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: (err) => console.error('Error al eliminar viaje', err),
    });
  }

  /**
   * ✅ Agregar viaje al carrito creando la orden en el backend
   */
  addToCart(trip: Trip): void {
    // Validaciones básicas
    if (trip.status !== 'active') {
      alert('⚠️ Este viaje no está disponible en este momento');
      return;
    }

    if (trip.availableSeats < 1) {
      alert('⚠️ No hay asientos disponibles para este viaje');
      return;
    }

    const endDate = new Date(trip.endDate);
    if (endDate < new Date()) {
      alert('⚠️ Este viaje ya ha finalizado');
      return;
    }

    // Verificar si el usuario es cliente
    if (!this.clientId) {
      alert('⚠️ Debes ser un cliente registrado para agregar al carrito.\n\nPor favor, completa tu perfil de cliente primero.');
      return;
    }

    // Crear la orden en el backend
    const orderData: TripClient = {
      tripId: trip.id,
      clientId: this.clientId,
      travelers: 1,
      quantity: 1,
      installments: 1,
      totalAmount: trip.price,
      totalWithInterest: trip.price,
      interestRate: 0
    };

    console.log('📦 Creando orden:', orderData);

    this.tripClientService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('✅ Orden creada:', response);

        // Agregar al carrito local
        this.cartService.addToCart(trip, 1);

        alert(`✅ "${trip.name}" agregado al carrito correctamente`);
      },
      error: (err) => {
        console.error('❌ Error al crear orden:', err);

        if (err.status === 401) {
          alert('⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (err.status === 400) {
          alert('⚠️ No se pudo crear la orden. Verifica los datos e intenta de nuevo.');
        } else {
          alert('❌ Error al agregar al carrito. Intenta de nuevo más tarde.');
        }
      }
    });
  }
}
