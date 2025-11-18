// transportation-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    return this.http.post<TransportationService>(this.businessApiUrl, transportationService);
  }

  updateTransportationService(id: string, transportationService: TransportationService): Observable<TransportationService> {
    return this.http.put<TransportationService>(`${this.businessApiUrl}/${id}`, transportationService);
  }

  deleteTransportationService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}
