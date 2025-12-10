# 🚀 GUÍA DE INTEGRACIÓN API - FRONTEND ANGULAR

## 📋 Tabla de Contenidos
- [Configuración Base](#configuración-base)
- [1. Búsqueda Principal (Main Page Form)](#1-búsqueda-principal-main-page-form)
- [2. Endpoints por Categoría (Navbar)](#2-endpoints-por-categoría-navbar)
  - [A. Hoteles](#a-hoteles)
  - [B. Vuelos/Journeys](#b-vuelosjourneys)
  - [C. Viajes (Trips)](#c-viajes-trips)
  - [D. Planes Turísticos](#d-planes-turísticos)
- [3. Reservas (Bookings)](#3-reservas-bookings)
- [4. Interfaces TypeScript](#4-interfaces-typescript-completas)
- [5. Servicios Angular - Ejemplos](#5-servicios-angular---ejemplos)

---

## 🔧 Configuración Base

### URL Base del Backend
```typescript
const API_BASE_URL = 'http://localhost:3333/api';
```

### Headers Comunes
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

---

## 1. 🔍 Búsqueda Principal (Main Page Form)

### Contexto
Actualmente el backend **NO tiene un endpoint de búsqueda unificada**. Tienes dos opciones:

#### **Opción A: Búsqueda de Viajes (Recomendada)**
Los viajes (Trips) son el núcleo del sistema ya que integran hoteles, planes y transporte.

**Endpoint:** `GET /api/trips`

**Query Parameters:**
```typescript
{
  page?: number;           // Paginación (default: 1)
  limit?: number;          // Items por página (default: 10)
  destination?: string;    // Filtro por destino
  startDate?: string;      // Fecha inicio (ISO 8601: 2025-12-10)
  endDate?: string;        // Fecha fin (ISO 8601: 2025-12-20)
  minPrice?: number;       // Precio mínimo
  maxPrice?: number;       // Precio máximo
  status?: string;         // Estado: 'published' | 'active'
  availableSeats?: number; // Asientos mínimos disponibles
}
```

**Ejemplo de Petición:**
```typescript
GET /api/trips?destination=Cartagena&startDate=2025-12-15&endDate=2025-12-20&status=published&page=1&limit=10
```

**Respuesta:**
```json
{
  "message": "Trips retrieved successfully",
  "data": {
    "meta": {
      "total": 45,
      "per_page": 10,
      "current_page": 1,
      "last_page": 5,
      "first_page": 1,
      "first_page_url": "/?page=1",
      "last_page_url": "/?page=5",
      "next_page_url": "/?page=2",
      "previous_page_url": null
    },
    "data": [
      {
        "id": 1,
        "name": "Tour Cartagena Mágica",
        "description": "Descubre la ciudad amurallada...",
        "price": 1500000,
        "capacity": 30,
        "availableSeats": 15,
        "status": "published",
        "startDate": "2025-12-15T00:00:00.000Z",
        "endDate": "2025-12-20T00:00:00.000Z",
        "destination": "Cartagena",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-05T15:30:00.000Z"
      }
    ]
  }
}
```

#### **Opción B: Búsqueda de Hoteles con Disponibilidad**

**Endpoint:** `GET /api/hotels`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  municipalityId?: number;  // ID del municipio/ciudad
  starRating?: number;      // Estrellas del hotel (1-5)
  status?: string;          // 'active'
}
```

---

## 2. 📂 Endpoints por Categoría (Navbar)

### A. 🏨 HOTELES

#### **Listar Todos los Hoteles**

**Endpoint:** `GET /api/hotels`

**Método:** GET

**Query Parameters:**
```typescript
{
  page?: number;        // Número de página (default: 1)
  limit?: number;       // Items por página (default: 10)
}
```

**Ejemplo de Petición:**
```typescript
GET /api/hotels?page=1&limit=20
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Hotels retrieved successfully",
  "data": {
    "meta": {
      "total": 150,
      "per_page": 20,
      "current_page": 1,
      "last_page": 8
    },
    "data": [
      {
        "id": 1,
        "hotelAdminId": 5,
        "municipalityId": 10,
        "name": "Hotel Caribe Plaza",
        "address": "Calle 10 #5-20, Centro Histórico",
        "phone": "+57 300 1234567",
        "email": "info@hotelcaribe.com",
        "starRating": 5,
        "status": "active",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-10T14:30:00.000Z",
        "municipality": {
          "id": 10,
          "name": "Cartagena",
          "departmentId": 2
        },
        "rooms": [
          {
            "id": 1,
            "hotelId": 1,
            "roomNumber": "101",
            "roomType": "Suite",
            "capacity": 2,
            "pricePerNight": 350000,
            "status": "available"
          }
        ]
      }
    ]
  }
}
```

#### **Obtener Hotel por ID**

**Endpoint:** `GET /api/hotels/:id`

**Método:** GET

**Parámetros de URL:**
- `id` (number, required): ID del hotel

**Ejemplo:**
```typescript
GET /api/hotels/1
```

**Respuesta:**
```json
{
  "message": "Hotel retrieved successfully",
  "data": {
    "id": 1,
    "name": "Hotel Caribe Plaza",
    "address": "Calle 10 #5-20, Centro Histórico",
    "phone": "+57 300 1234567",
    "email": "info@hotelcaribe.com",
    "starRating": 5,
    "status": "active",
    "municipality": {
      "id": 10,
      "name": "Cartagena",
      "department": {
        "id": 2,
        "name": "Bolívar"
      }
    },
    "rooms": [
      {
        "id": 1,
        "roomNumber": "101",
        "roomType": "Suite",
        "capacity": 2,
        "pricePerNight": 350000,
        "status": "available"
      },
      {
        "id": 2,
        "roomNumber": "102",
        "roomType": "Doble",
        "capacity": 2,
        "pricePerNight": 250000,
        "status": "available"
      }
    ]
  }
}
```

#### **Filtros Recomendados para Implementar**

Actualmente el backend solo soporta paginación. **RECOMENDACIÓN:** Necesitas agregar filtros adicionales en el servicio. Los filtros sugeridos son:

```typescript
// Filtros a implementar en el backend
{
  municipalityId?: number;   // Filtrar por ciudad
  starRating?: number;       // Filtrar por estrellas
  minPrice?: number;         // Precio mínimo por noche
  maxPrice?: number;         // Precio máximo por noche
  status?: string;           // Estado: 'active' | 'inactive'
  capacity?: number;         // Capacidad mínima de habitaciones
}
```

---

### B. ✈️ VUELOS / JOURNEYS

En tu backend, los "vuelos" se manejan como **Journeys (Trayectos)** que conectan municipios.

#### **Listar Journeys (Trayectos)**

**Endpoint:** `GET /api/journeys`

**Método:** GET

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
}
```

**Ejemplo:**
```typescript
GET /api/journeys?page=1&limit=20
```

**Respuesta:**
```json
{
  "message": "Journeys retrieved successfully",
  "data": {
    "meta": {
      "total": 80,
      "per_page": 20,
      "current_page": 1
    },
    "data": [
      {
        "id": 1,
        "originMunicipalityId": 1,
        "destinationMunicipalityId": 10,
        "distance": 1050,
        "originMunicipality": {
          "id": 1,
          "name": "Bogotá",
          "departmentId": 1
        },
        "destinationMunicipality": {
          "id": 10,
          "name": "Cartagena",
          "departmentId": 2
        },
        "transportationServices": [
          {
            "id": 1,
            "journeyId": 1,
            "vehicleId": 5,
            "aircraftId": null,
            "transportType": "aircraft",
            "departureTime": "2025-12-15T06:00:00.000Z",
            "arrivalTime": "2025-12-15T07:30:00.000Z",
            "price": 450000,
            "status": "scheduled"
          }
        ],
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### **Obtener Journey por ID**

**Endpoint:** `GET /api/journeys/:id`

**Método:** GET

**Ejemplo:**
```typescript
GET /api/journeys/1
```

#### **Filtros Sugeridos para Vuelos**

```typescript
{
  originMunicipalityId?: number;      // Ciudad origen
  destinationMunicipalityId?: number; // Ciudad destino
  departureDate?: string;             // Fecha salida (ISO 8601)
  transportType?: string;             // 'aircraft' | 'bus' | 'van'
  minPrice?: number;
  maxPrice?: number;
}
```

---

### C. 🗺️ VIAJES (TRIPS)

Los Trips son paquetes turísticos completos que incluyen transporte, alojamiento y planes.

#### **Listar Viajes**

**Endpoint:** `GET /api/trips`

**Método:** GET

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
}
```

**Ejemplo:**
```typescript
GET /api/trips?page=1&limit=10
```

**Respuesta:**
```json
{
  "message": "Trips retrieved successfully",
  "data": {
    "meta": {
      "total": 25,
      "per_page": 10,
      "current_page": 1
    },
    "data": [
      {
        "id": 1,
        "name": "Tour Caribe Colombiano",
        "description": "Explora las mejores playas del Caribe...",
        "price": 2500000,
        "capacity": 40,
        "availableSeats": 20,
        "status": "published",
        "startDate": "2025-12-15T00:00:00.000Z",
        "endDate": "2025-12-22T00:00:00.000Z",
        "destination": "Cartagena - Santa Marta - Tayrona",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-10T15:00:00.000Z"
      }
    ]
  }
}
```

#### **Obtener Viaje por ID (con relaciones)**

**Endpoint:** `GET /api/trips/:id`

**Método:** GET

**Ejemplo:**
```typescript
GET /api/trips/1
```

**Respuesta:**
```json
{
  "message": "Trip retrieved successfully",
  "data": {
    "id": 1,
    "name": "Tour Caribe Colombiano",
    "description": "Explora las mejores playas del Caribe...",
    "price": 2500000,
    "capacity": 40,
    "availableSeats": 20,
    "status": "published",
    "startDate": "2025-12-15T00:00:00.000Z",
    "endDate": "2025-12-22T00:00:00.000Z",
    "destination": "Cartagena - Santa Marta - Tayrona",
    "tripClients": [
      {
        "id": 1,
        "tripId": 1,
        "clientId": 10
      }
    ],
    "tripPlans": [
      {
        "id": 1,
        "tripId": 1,
        "planId": 5,
        "plan": {
          "id": 5,
          "name": "City Tour Cartagena",
          "description": "Recorrido por el centro histórico",
          "price": 150000,
          "duration": 4
        }
      }
    ],
    "bookings": [
      {
        "id": 1,
        "tripId": 1,
        "roomId": 10,
        "checkInDate": "2025-12-15T00:00:00.000Z",
        "checkOutDate": "2025-12-18T00:00:00.000Z",
        "room": {
          "id": 10,
          "roomNumber": "301",
          "roomType": "Suite",
          "pricePerNight": 400000,
          "hotel": {
            "id": 1,
            "name": "Hotel Caribe Plaza"
          }
        }
      }
    ],
    "transportItineraries": [
      {
        "id": 1,
        "tripId": 1,
        "transportationServiceId": 5,
        "departureDate": "2025-12-15T06:00:00.000Z",
        "arrivalDate": "2025-12-15T07:30:00.000Z"
      }
    ]
  }
}
```

#### **Filtros Sugeridos para Viajes**

```typescript
{
  destination?: string;       // Buscar por destino
  startDate?: string;         // Fecha inicio
  endDate?: string;           // Fecha fin
  minPrice?: number;
  maxPrice?: number;
  status?: 'published' | 'active';
  minAvailableSeats?: number; // Asientos mínimos
}
```

---

### D. 🎭 PLANES TURÍSTICOS

Los planes son actividades turísticas que se pueden incluir en los viajes.

#### **Listar Planes**

**Endpoint:** `GET /api/plans`

**Método:** GET

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
}
```

**Ejemplo:**
```typescript
GET /api/plans?page=1&limit=20
```

**Respuesta:**
```json
{
  "message": "Plans retrieved successfully",
  "data": {
    "meta": {
      "total": 50,
      "per_page": 20,
      "current_page": 1
    },
    "data": [
      {
        "id": 1,
        "name": "City Tour Cartagena",
        "description": "Recorrido por el centro histórico de la ciudad amurallada",
        "price": 150000,
        "duration": 4,
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Buceo en Islas del Rosario",
        "description": "Experiencia de buceo en aguas cristalinas",
        "price": 350000,
        "duration": 8,
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### **Obtener Plan por ID**

**Endpoint:** `GET /api/plans/:id`

**Método:** GET

**Ejemplo:**
```typescript
GET /api/plans/1
```

**Respuesta:**
```json
{
  "message": "Plan retrieved successfully",
  "data": {
    "id": 1,
    "name": "City Tour Cartagena",
    "description": "Recorrido por el centro histórico...",
    "price": 150000,
    "duration": 4,
    "planActivities": [
      {
        "id": 1,
        "planId": 1,
        "touristActivityId": 5,
        "startTime": "09:00:00",
        "endTime": "13:00:00",
        "touristActivity": {
          "id": 5,
          "name": "Visita al Castillo San Felipe",
          "description": "Tour guiado por la fortaleza",
          "municipalityId": 10
        }
      }
    ]
  }
}
```

#### **Filtros Sugeridos para Planes**

```typescript
{
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;  // Duración mínima en horas
  maxDuration?: number;  // Duración máxima en horas
  name?: string;         // Búsqueda por nombre
}
```

---

## 3. 📅 RESERVAS (BOOKINGS)

Para manejar las reservas de habitaciones en viajes.

#### **Listar Reservas**

**Endpoint:** `GET /api/bookings`

**Método:** GET

**Respuesta:**
```json
{
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": 1,
      "tripId": 1,
      "roomId": 10,
      "checkInDate": "2025-12-15T00:00:00.000Z",
      "checkOutDate": "2025-12-18T00:00:00.000Z",
      "totalPrice": 1200000,
      "status": "confirmed",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

#### **Obtener Reservas por Viaje**

**Endpoint:** `GET /api/bookings/trip/:tripId`

**Método:** GET

**Ejemplo:**
```typescript
GET /api/bookings/trip/1
```

#### **Crear Reserva**

**Endpoint:** `POST /api/bookings/assign`

**Método:** POST

**Payload:**
```json
{
  "tripId": 1,
  "roomId": 10,
  "checkInDate": "2025-12-15",
  "checkOutDate": "2025-12-18"
}
```

**Respuesta:**
```json
{
  "message": "Room assigned successfully",
  "data": {
    "id": 1,
    "tripId": 1,
    "roomId": 10,
    "checkInDate": "2025-12-15T00:00:00.000Z",
    "checkOutDate": "2025-12-18T00:00:00.000Z",
    "totalPrice": 1200000,
    "status": "confirmed"
  }
}
```

---

## 4. 🔷 INTERFACES TYPESCRIPT COMPLETAS

### Interfaces Base

```typescript
// ============================================
// MUNICIPIO (CIUDAD)
// ============================================
export interface Municipality {
  id: number;
  name: string;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
  department?: Department;
}

export interface Department {
  id: number;
  name: string;
  countryId: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// HOTEL
// ============================================
export interface Hotel {
  id: number;
  hotelAdminId: number;
  municipalityId: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  starRating: number;  // 1-5
  status: 'active' | 'inactive' | 'under_renovation';
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  municipality?: Municipality;
  hotelAdmin?: HotelAdmin;
  rooms?: Room[];
  cars?: Car[];
}

export interface HotelAdmin {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// HABITACIÓN
// ============================================
export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  roomType: string;  // 'Suite', 'Doble', 'Sencilla', etc.
  capacity: number;
  pricePerNight: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  hotel?: Hotel;
  bookings?: Booking[];
}

// ============================================
// VIAJE (TRIP)
// ============================================
export interface Trip {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  availableSeats: number;
  status: 'draft' | 'published' | 'active' | 'full' | 'completed' | 'cancelled';
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  destination: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  tripClients?: TripClient[];
  tripPlans?: TripPlan[];
  bookings?: Booking[];
  transportItineraries?: TransportItinerary[];
}

export interface TripClient {
  id: number;
  tripId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PLAN TURÍSTICO
// ============================================
export interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number | null;  // Duración en horas
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  planActivities?: PlanActivity[];
  tripPlans?: TripPlan[];
}

export interface TripPlan {
  id: number;
  tripId: number;
  planId: number;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

export interface PlanActivity {
  id: number;
  planId: number;
  touristActivityId: number;
  startTime: string;  // HH:mm:ss
  endTime: string;    // HH:mm:ss
  createdAt: string;
  updatedAt: string;
  touristActivity?: TouristActivity;
}

export interface TouristActivity {
  id: number;
  name: string;
  description: string;
  municipalityId: number;
  category: string;
  price: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  municipality?: Municipality;
}

// ============================================
// TRAYECTO / VUELO (JOURNEY)
// ============================================
export interface Journey {
  id: number;
  originMunicipalityId: number;
  destinationMunicipalityId: number;
  distance: number | null;  // Distancia en KM
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  originMunicipality?: Municipality;
  destinationMunicipality?: Municipality;
  transportationServices?: TransportationService[];
}

export interface TransportationService {
  id: number;
  journeyId: number;
  vehicleId: number | null;
  aircraftId: number | null;
  transportType: 'aircraft' | 'bus' | 'van' | 'car';
  departureTime: string;  // ISO 8601
  arrivalTime: string;    // ISO 8601
  price: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  journey?: Journey;
  vehicle?: Vehicle;
  aircraft?: Aircraft;
}

export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: number;
  vehicleType: 'bus' | 'van' | 'car';
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Aircraft {
  id: number;
  airlineId: number;
  registration: string;
  model: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  airline?: Airline;
}

export interface Airline {
  id: number;
  name: string;
  code: string;  // Código IATA
  country: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// RESERVA / BOOKING
// ============================================
export interface Booking {
  id: number;
  tripId: number;
  roomId: number;
  checkInDate: string;   // ISO 8601
  checkOutDate: string;  // ISO 8601
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  trip?: Trip;
  room?: Room;
}

export interface TransportItinerary {
  id: number;
  tripId: number;
  transportationServiceId: number;
  departureDate: string;
  arrivalDate: string;
  createdAt: string;
  updatedAt: string;
  transportationService?: TransportationService;
}

// ============================================
// CAR (Vehículo de alquiler)
// ============================================
export interface Car {
  id: number;
  hotelId: number;
  vehicleId: number;
  pricePerDay: number;
  status: 'available' | 'rented' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  hotel?: Hotel;
  vehicle?: Vehicle;
}

// ============================================
// RESPUESTAS PAGINADAS
// ============================================
export interface PaginatedResponse<T> {
  message: string;
  data: {
    meta: PaginationMeta;
    data: T[];
  };
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  first_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  previous_page_url: string | null;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
```

### Interfaces para Formularios (DTOs)

```typescript
// ============================================
// DTOs PARA CREAR/ACTUALIZAR
// ============================================

export interface CreateBookingDto {
  tripId: number;
  roomId: number;
  checkInDate: string;  // 'YYYY-MM-DD'
  checkOutDate: string; // 'YYYY-MM-DD'
}

export interface SearchTripsDto {
  page?: number;
  limit?: number;
  destination?: string;
  startDate?: string;  // 'YYYY-MM-DD'
  endDate?: string;    // 'YYYY-MM-DD'
  minPrice?: number;
  maxPrice?: number;
  status?: 'published' | 'active';
  minAvailableSeats?: number;
}

export interface SearchHotelsDto {
  page?: number;
  limit?: number;
  municipalityId?: number;
  starRating?: number;
  status?: 'active';
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchJourneysDto {
  page?: number;
  limit?: number;
  originMunicipalityId?: number;
  destinationMunicipalityId?: number;
  departureDate?: string;
  transportType?: 'aircraft' | 'bus' | 'van';
}

export interface SearchPlansDto {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  name?: string;
}

// ============================================
// DTO PARA BÚSQUEDA PRINCIPAL (PROPUESTO)
// ============================================
export interface MainSearchDto {
  origin: string;           // Ciudad origen
  destination: string;      // Ciudad destino
  checkInDate: string;      // Fecha entrada 'YYYY-MM-DD'
  checkOutDate: string;     // Fecha salida 'YYYY-MM-DD'
  rooms: number;            // Número de habitaciones
  adults: number;           // Número de adultos
  children: number;         // Número de niños
}
```

---

## 5. 🛠️ SERVICIOS ANGULAR - EJEMPLOS

### Configuración del Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333/api'
};
```

### Servicio Base API

```typescript
// src/app/services/api-base.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  protected buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    
    return httpParams;
  }
}
```

### Servicio de Hoteles

```typescript
// src/app/services/hotels.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { 
  Hotel, 
  PaginatedResponse, 
  ApiResponse, 
  SearchHotelsDto 
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class HotelsService extends ApiBaseService {

  /**
   * Obtener todos los hoteles con filtros opcionales
   */
  getHotels(filters: SearchHotelsDto = {}): Observable<PaginatedResponse<Hotel>> {
    const params = this.buildParams(filters);
    
    return this.http.get<PaginatedResponse<Hotel>>(
      `${this.apiUrl}/hotels`,
      { params, headers: this.getHeaders() }
    );
  }

  /**
   * Obtener un hotel por ID
   */
  getHotelById(id: number): Observable<ApiResponse<Hotel>> {
    return this.http.get<ApiResponse<Hotel>>(
      `${this.apiUrl}/hotels/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crear un nuevo hotel (Admin)
   */
  createHotel(hotel: Partial<Hotel>): Observable<ApiResponse<Hotel>> {
    return this.http.post<ApiResponse<Hotel>>(
      `${this.apiUrl}/hotels`,
      hotel,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar un hotel (Admin)
   */
  updateHotel(id: number, hotel: Partial<Hotel>): Observable<ApiResponse<Hotel>> {
    return this.http.put<ApiResponse<Hotel>>(
      `${this.apiUrl}/hotels/${id}`,
      hotel,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Eliminar un hotel (Admin)
   */
  deleteHotel(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/hotels/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
```

### Servicio de Viajes

```typescript
// src/app/services/trips.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { 
  Trip, 
  PaginatedResponse, 
  ApiResponse, 
  SearchTripsDto 
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TripsService extends ApiBaseService {

  /**
   * Buscar viajes con filtros
   */
  searchTrips(filters: SearchTripsDto = {}): Observable<PaginatedResponse<Trip>> {
    const params = this.buildParams(filters);
    
    return this.http.get<PaginatedResponse<Trip>>(
      `${this.apiUrl}/trips`,
      { params, headers: this.getHeaders() }
    );
  }

  /**
   * Obtener un viaje completo con todas sus relaciones
   */
  getTripById(id: number): Observable<ApiResponse<Trip>> {
    return this.http.get<ApiResponse<Trip>>(
      `${this.apiUrl}/trips/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crear un nuevo viaje (Admin)
   */
  createTrip(trip: Partial<Trip>): Observable<ApiResponse<Trip>> {
    return this.http.post<ApiResponse<Trip>>(
      `${this.apiUrl}/trips`,
      trip,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar un viaje (Admin)
   */
  updateTrip(id: number, trip: Partial<Trip>): Observable<ApiResponse<Trip>> {
    return this.http.put<ApiResponse<Trip>>(
      `${this.apiUrl}/trips/${id}`,
      trip,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Eliminar un viaje (Admin)
   */
  deleteTrip(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/trips/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
```

### Servicio de Planes

```typescript
// src/app/services/plans.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { 
  Plan, 
  PaginatedResponse, 
  ApiResponse, 
  SearchPlansDto 
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlansService extends ApiBaseService {

  /**
   * Obtener todos los planes con filtros
   */
  getPlans(filters: SearchPlansDto = {}): Observable<PaginatedResponse<Plan>> {
    const params = this.buildParams(filters);
    
    return this.http.get<PaginatedResponse<Plan>>(
      `${this.apiUrl}/plans`,
      { params, headers: this.getHeaders() }
    );
  }

  /**
   * Obtener un plan por ID con sus actividades
   */
  getPlanById(id: number): Observable<ApiResponse<Plan>> {
    return this.http.get<ApiResponse<Plan>>(
      `${this.apiUrl}/plans/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
```

### Servicio de Journeys (Vuelos)

```typescript
// src/app/services/journeys.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { 
  Journey, 
  PaginatedResponse, 
  ApiResponse, 
  SearchJourneysDto 
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class JourneysService extends ApiBaseService {

  /**
   * Buscar trayectos/vuelos
   */
  searchJourneys(filters: SearchJourneysDto = {}): Observable<PaginatedResponse<Journey>> {
    const params = this.buildParams(filters);
    
    return this.http.get<PaginatedResponse<Journey>>(
      `${this.apiUrl}/journeys`,
      { params, headers: this.getHeaders() }
    );
  }

  /**
   * Obtener un trayecto con sus servicios de transporte
   */
  getJourneyById(id: number): Observable<ApiResponse<Journey>> {
    return this.http.get<ApiResponse<Journey>>(
      `${this.apiUrl}/journeys/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
```

### Servicio de Reservas

```typescript
// src/app/services/bookings.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { 
  Booking, 
  ApiResponse, 
  CreateBookingDto 
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends ApiBaseService {

  /**
   * Obtener todas las reservas
   */
  getBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(
      `${this.apiUrl}/bookings`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener reservas por viaje
   */
  getBookingsByTrip(tripId: number): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(
      `${this.apiUrl}/bookings/trip/${tripId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener reservas por habitación
   */
  getBookingsByRoom(roomId: number): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(
      `${this.apiUrl}/bookings/room/${roomId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crear una reserva (asignar habitación a viaje)
   */
  createBooking(booking: CreateBookingDto): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(
      `${this.apiUrl}/bookings/assign`,
      booking,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cancelar una reserva
   */
  cancelBooking(tripId: number, roomId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/bookings/unassign/${tripId}/${roomId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener una reserva por ID
   */
  getBookingById(id: number): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(
      `${this.apiUrl}/bookings/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
```

---

## 📝 Ejemplo de Uso en Componente Angular

### Componente de Búsqueda Principal

```typescript
// src/app/components/search/search.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TripsService } from '../../services/trips.service';
import { Trip, SearchTripsDto } from '../../interfaces/api.interfaces';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  trips: Trip[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tripsService: TripsService
  ) {
    this.searchForm = this.fb.group({
      destination: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      rooms: [1, [Validators.required, Validators.min(1)]],
      adults: [2, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  onSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.searchForm.value;

    // Construir filtros para búsqueda de viajes
    const filters: SearchTripsDto = {
      destination: formValue.destination,
      startDate: formValue.checkInDate,
      endDate: formValue.checkOutDate,
      status: 'published',
      minAvailableSeats: formValue.adults + formValue.children,
      page: 1,
      limit: 20
    };

    this.tripsService.searchTrips(filters).subscribe({
      next: (response) => {
        this.trips = response.data.data;
        this.loading = false;
        console.log('Viajes encontrados:', this.trips);
      },
      error: (err) => {
        this.error = 'Error al buscar viajes. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }
}
```

### Componente de Listado de Hoteles

```typescript
// src/app/components/hotels-list/hotels-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HotelsService } from '../../services/hotels.service';
import { Hotel, SearchHotelsDto } from '../../interfaces/api.interfaces';

@Component({
  selector: 'app-hotels-list',
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.css']
})
export class HotelsListComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;

  // Filtros
  filters: SearchHotelsDto = {
    page: 1,
    limit: 12,
    status: 'active'
  };

  constructor(private hotelsService: HotelsService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading = true;

    this.hotelsService.getHotels(this.filters).subscribe({
      next: (response) => {
        this.hotels = response.data.data;
        this.currentPage = response.data.meta.current_page;
        this.totalPages = response.data.meta.last_page;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando hoteles:', err);
        this.loading = false;
      }
    });
  }

  filterByStars(stars: number): void {
    this.filters.starRating = stars;
    this.filters.page = 1;
    this.loadHotels();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.filters.page = this.currentPage + 1;
      this.loadHotels();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.filters.page = this.currentPage - 1;
      this.loadHotels();
    }
  }
}
```

---

## 🚨 NOTAS IMPORTANTES

### 1. **Filtros No Implementados en el Backend**

Actualmente, los controladores solo soportan **paginación básica** (`page` y `limit`). 

**DEBES IMPLEMENTAR** los siguientes filtros en los servicios del backend:

#### Para Hoteles:
- `municipalityId` (filtrar por ciudad)
- `starRating` (filtrar por estrellas)
- `minPrice` / `maxPrice` (rango de precio)
- `status` (estado del hotel)

#### Para Viajes:
- `destination` (buscar por destino)
- `startDate` / `endDate` (rango de fechas)
- `minPrice` / `maxPrice`
- `status` (publicado, activo)
- `minAvailableSeats` (asientos disponibles)

#### Para Journeys:
- `originMunicipalityId` / `destinationMunicipalityId`
- `departureDate`
- `transportType`

#### Para Planes:
- `minPrice` / `maxPrice`
- `minDuration` / `maxDuration`
- `name` (búsqueda por texto)

### 2. **Endpoint de Búsqueda Unificada**

Considera crear un endpoint específico para la búsqueda principal:

```typescript
POST /api/search
```

**Payload:**
```json
{
  "origin": "Bogotá",
  "destination": "Cartagena",
  "checkInDate": "2025-12-15",
  "checkOutDate": "2025-12-20",
  "rooms": 2,
  "adults": 4,
  "children": 1
}
```

Este endpoint podría devolver un objeto combinado con:
- Viajes disponibles
- Hoteles en el destino
- Vuelos/Journeys disponibles
- Planes turísticos recomendados

### 3. **Preload de Relaciones**

Asegúrate de que tus servicios del backend hagan **preload** de las relaciones necesarias para evitar múltiples peticiones:

```typescript
// En el servicio del backend
const trip = await Trip.query()
  .where('id', id)
  .preload('tripPlans', (query) => {
    query.preload('plan')
  })
  .preload('bookings', (query) => {
    query.preload('room', (roomQuery) => {
      roomQuery.preload('hotel')
    })
  })
  .preload('transportItineraries', (query) => {
    query.preload('transportationService')
  })
  .first()
```

### 4. **Manejo de Errores**

Todos los endpoints devuelven respuestas consistentes:

**Éxito:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "message": "Error description",
  "error": "Detailed error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### 5. **Autenticación**

Si implementas autenticación, agrega el token en los headers:

```typescript
protected getHeaders(): HttpHeaders {
  const token = localStorage.getItem('auth_token');
  
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}
```

---

## 📊 RESUMEN DE ENDPOINTS

| Recurso | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| **Hoteles** | `/api/hotels` | GET | Listar hoteles |
| | `/api/hotels/:id` | GET | Obtener hotel por ID |
| | `/api/hotels` | POST | Crear hotel |
| | `/api/hotels/:id` | PUT | Actualizar hotel |
| | `/api/hotels/:id` | DELETE | Eliminar hotel |
| **Viajes** | `/api/trips` | GET | Listar viajes |
| | `/api/trips/:id` | GET | Obtener viaje por ID |
| | `/api/trips` | POST | Crear viaje |
| | `/api/trips/:id` | PUT | Actualizar viaje |
| | `/api/trips/:id` | DELETE | Eliminar viaje |
| **Planes** | `/api/plans` | GET | Listar planes |
| | `/api/plans/:id` | GET | Obtener plan por ID |
| | `/api/plans` | POST | Crear plan |
| | `/api/plans/:id` | PUT | Actualizar plan |
| | `/api/plans/:id` | DELETE | Eliminar plan |
| **Journeys** | `/api/journeys` | GET | Listar trayectos |
| | `/api/journeys/:id` | GET | Obtener trayecto por ID |
| | `/api/journeys` | POST | Crear trayecto |
| | `/api/journeys/:id` | PUT | Actualizar trayecto |
| | `/api/journeys/:id` | DELETE | Eliminar trayecto |
| **Reservas** | `/api/bookings` | GET | Listar reservas |
| | `/api/bookings/:id` | GET | Obtener reserva por ID |
| | `/api/bookings/trip/:tripId` | GET | Reservas por viaje |
| | `/api/bookings/room/:roomId` | GET | Reservas por habitación |
| | `/api/bookings/assign` | POST | Crear reserva |
| | `/api/bookings/unassign/:tripId/:roomId` | DELETE | Cancelar reserva |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend (Angular)
- [ ] Crear interfaces TypeScript con todos los modelos
- [ ] Configurar `environment.ts` con la URL del backend
- [ ] Crear servicio base `ApiBaseService`
- [ ] Crear servicios específicos (Hotels, Trips, Plans, Journeys, Bookings)
- [ ] Implementar componente de búsqueda principal
- [ ] Implementar componentes de listado por categoría
- [ ] Implementar componente de detalle de viaje/hotel/plan
- [ ] Agregar manejo de errores y loading states
- [ ] Implementar paginación
- [ ] Agregar interceptor HTTP para tokens (si usas auth)

### Backend (AdonisJS)
- [ ] Implementar filtros en `HotelsService.getAllHotels()`
- [ ] Implementar filtros en `TripsService.getAllTrips()`
- [ ] Implementar filtros en `PlansService.getAllPlans()`
- [ ] Implementar filtros en `JourneysService.getAllJourneys()`
- [ ] Agregar preload de relaciones en métodos `show()`
- [ ] Crear endpoint de búsqueda unificada `/api/search` (opcional)
- [ ] Documentar endpoints con Swagger/OpenAPI (opcional)
- [ ] Agregar validación de fechas en búsquedas
- [ ] Implementar cache para queries frecuentes (opcional)

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Implementa los filtros en el backend** primero
2. **Prueba los endpoints** con Postman usando las colecciones existentes
3. **Crea las interfaces TypeScript** en Angular
4. **Implementa los servicios** uno por uno
5. **Desarrolla los componentes** de listado antes que los de detalle
6. **Agrega el manejo de estados** (loading, error, success)
7. **Implementa la paginación** correctamente
8. **Optimiza las queries** con preload de relaciones

---

**🚀 ¡Listo para integrar! Esta guía cubre todos los casos de uso que mencionaste.**

**📧 Si necesitas ayuda adicional o encontrar errores, consulta los logs del backend o verifica las colecciones de Postman incluidas en el proyecto.**

---

*Fecha de creación: Diciembre 10, 2025*  
*Versión del Backend: AdonisJS 6*  
*Framework Frontend: Angular*

