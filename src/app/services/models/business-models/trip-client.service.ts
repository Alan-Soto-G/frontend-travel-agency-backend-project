import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripClient } from 'src/app/models/business-models/trip-client.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripClientService {
  private businessApiUrl = `${environment.businessApiUrl}trip-clients`;

  constructor(private http: HttpClient) {}

  /**
   * GET /trip-clients
   * Obtener todos los trip clients con paginación opcional
   */
  getAllTripClients(page?: number, limit?: number): Observable<any> {
    let url = this.businessApiUrl;
    const params: string[] = [];
    
    if (page) params.push(`page=${page}`);
    if (limit) params.push(`limit=${limit}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<any>(url);
  }

  /**
   * GET /trip-clients/my-orders
   * Obtener órdenes del usuario autenticado
   */
  getMyOrders(): Observable<any> {
    return this.http.get<any>(`${this.businessApiUrl}/my-orders`);
  }

  /**
   * GET /trip-clients/client/:clientId
   * Obtener todos los viajes de un cliente específico
   */
  getTripsByClient(clientId: number): Observable<any> {
    return this.http.get<any>(`${this.businessApiUrl}/client/${clientId}`);
  }

  /**
   * GET /trip-clients/:id
   * Obtener un trip client específico por ID
   */
  getTripClientById(id: number): Observable<any> {
    return this.http.get<any>(`${this.businessApiUrl}/${id}`);
  }

  /**
   * POST /trip-clients
   * Crear un nuevo trip client (orden)
   */
  createTripClient(data: Partial<TripClient>): Observable<any> {
    return this.http.post<any>(this.businessApiUrl, data);
  }

  /**
   * POST /trip-clients (alias para createTripClient)
   * Crear una nueva orden
   */
  createOrder(data: Partial<TripClient>): Observable<any> {
    return this.createTripClient(data);
  }

  /**
   * POST /trip-clients/assign
   * Asignar un cliente a un viaje
   */
  assignClientToTrip(data: { tripId: number; clientId: number; travelers?: number; quantity?: number }): Observable<any> {
    return this.http.post<any>(`${this.businessApiUrl}/assign`, data);
  }

  /**
   * PUT /trip-clients/:id
   * Actualizar un trip client
   */
  updateTripClient(id: number, data: Partial<TripClient>): Observable<any> {
    return this.http.put<any>(`${this.businessApiUrl}/${id}`, data);
  }

  /**
   * DELETE /trip-clients/:id
   * Eliminar un trip client
   */
  deleteTripClient(id: number): Observable<any> {
    return this.http.delete<any>(`${this.businessApiUrl}/${id}`);
  }

  /**
   * DELETE /trip-clients/unassign/:tripId/:clientId
   * Desasignar un cliente de un viaje
   */
  unassignClientFromTrip(tripId: number, clientId: number): Observable<any> {
    return this.http.delete<any>(`${this.businessApiUrl}/unassign/${tripId}/${clientId}`);
  }

  /**
   * Alias de getTripClientById para mantener compatibilidad
   */
  getOrderById(id: number): Observable<any> {
    return this.getTripClientById(id);
  }
}