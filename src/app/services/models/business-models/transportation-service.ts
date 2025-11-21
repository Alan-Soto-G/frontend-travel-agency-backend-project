// transportation-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { TransportationService } from '../../../models/business-models/transportation-service.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TransportationServiceService {
  private businessApiUrl = `${environment.businessApiUrl}transportation-services`;

  constructor(private http: HttpClient) {}

  getTransportationServices(): Observable<TransportationService[]> {
    return this.http.get<TransportationService[]>(this.businessApiUrl);
  }

  getTransportationServiceById(id: string): Observable<TransportationService> {
    return this.http.get<TransportationService>(`${this.businessApiUrl}/${id}`);
  }

  createTransportationService(transportationService: TransportationService): Observable<TransportationService> {
    console.log('📤 Datos enviados al backend:', transportationService); // <-- Log de datos enviados
    
    return this.http.post<TransportationService>(this.businessApiUrl, transportationService).pipe(
      tap(response => {
        console.log('✅ Respuesta exitosa del backend:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('❌ Error completo:', error);
        console.log('❌ Errores de validación:', error.error?.errors);
        console.log('❌ Mensaje de error:', error.error?.message);
        console.log('❌ Status:', error.status);
        return throwError(() => error);
      })
    );
  }

  updateTransportationService(id: string, transportationService: TransportationService): Observable<TransportationService> {
    return this.http.put<TransportationService>(`${this.businessApiUrl}/${id}`, transportationService);
  }

  deleteTransportationService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}
