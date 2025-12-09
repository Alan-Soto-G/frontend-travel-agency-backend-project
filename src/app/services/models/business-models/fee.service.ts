import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fee } from 'src/app/models/business-models/fee.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private businessApiUrl = `${environment.businessApiUrl}fees`;

  constructor(private http: HttpClient) {}

  getFees(): Observable<Fee[]> {
    return this.http.get<Fee[]>(this.businessApiUrl);
  }

  getFeeById(id: string): Observable<Fee> {
    return this.http.get<Fee>(`${this.businessApiUrl}/${id}`);
  }

  createFee(fee: Partial<Fee>): Observable<Fee> {
    return this.http.post<Fee>(this.businessApiUrl, fee);
  }

  updateFee(id: string, fee: Partial<Fee>): Observable<Fee> {
    return this.http.put<Fee>(`${this.businessApiUrl}/${id}`, fee);
  }

  deleteFee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }



  /**
   * GET /fees/my-installments
   * Obtener cuotas del usuario autenticado
   */
  getMyInstallments(): Observable<any> {
    return this.http.get<any>(`${this.businessApiUrl}/my-installments`);
  }

  /**
   * GET /fees/trip-client/:tripClientId
   * Obtener cuotas por ID de trip client
   */
  getInstallmentsByTripClient(tripClientId: number): Observable<Fee[]> {
    return this.http.get<Fee[]>(`${this.businessApiUrl}/trip-client/${tripClientId}`);
  }

  /**
   * Actualizar solo el estado de una cuota
   */
  updateFeeStatus(id: string, status: 'pending' | 'paid' | 'overdue'): Observable<Fee> {
    return this.updateFee(id, { status });
  }
}