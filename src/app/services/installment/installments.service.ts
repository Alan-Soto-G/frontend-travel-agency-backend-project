// src/app/services/installments/installments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Installment {
  id: number;
  tripClientId: number;
  installmentNumber: number;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentsResponse {
  message: string;
  data: {
    clientId: number;
    installments: Installment[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class InstallmentsService {
  private apiUrl = environment.businessApiUrl;
  private installmentsSubject = new BehaviorSubject<Installment[]>([]);
  public installments$ = this.installmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las cuotas del usuario autenticado
   * El backend usa el token para identificar al usuario
   */
  getMyInstallments(): Observable<InstallmentsResponse> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<InstallmentsResponse>(
      `${this.apiUrl}/my-installments`,
      { headers }
    ).pipe(
      tap(response => {
        this.installmentsSubject.next(response.data.installments);
      })
    );
  }

  /**
   * Obtener cuotas por TripClient específico
   */
  getInstallmentsByTripClient(tripClientId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.get(
      `${this.apiUrl}/trip-client/${tripClientId}`,
      { headers }
    );
  }

  /**
   * Obtener headers con token de autenticación
   * El token se obtiene de las cookies
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getTokenFromCookie();
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener token de las cookies
   */
private getTokenFromCookie(): string {
  const name = 'token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  console.log('🍪 Cookies disponibles:', decodedCookie); // ← AGREGA ESTO
  
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      const token = cookie.substring(name.length, cookie.length);
      console.log('✅ Token encontrado:', token.substring(0, 50) + '...'); // ← Y ESTO
      return token;
    }
  }
  
  console.log('❌ Token NO encontrado'); // ← Y ESTO
  return '';
}
  /**
   * Estadísticas de cuotas
   */
  getInstallmentStats(installments: Installment[]) {
    const paid = installments.filter(i => i.status === 'paid').length;
    const pending = installments.filter(i => i.status === 'pending').length;
    const overdue = installments.filter(i => i.status === 'overdue').length;
    const total = installments.length;
    
    const paidAmount = installments
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const pendingAmount = installments
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0);
    
    return {
      total,
      paid,
      pending,
      overdue,
      paidAmount,
      pendingAmount,
      progress: total > 0 ? (paid / total) * 100 : 0
    };
  }
}