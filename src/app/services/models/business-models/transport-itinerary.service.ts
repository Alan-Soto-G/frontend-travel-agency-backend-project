import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransportItinerary } from 'src/app/models/business-models/transport-itinerary.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TransportItineraryService {
  private businessApiUrl = `${environment.businessApiUrl}transport-itineraries`;

  constructor(private http: HttpClient) {}

  getTransportItineraries(): Observable<TransportItinerary[]> {
    return this.http.get<TransportItinerary[]>(this.businessApiUrl);
  }

  getTransportItineraryById(id: string): Observable<TransportItinerary> {
    return this.http.get<TransportItinerary>(`${this.businessApiUrl}/${id}`);
  }

  createTransportItinerary(transportItinerary: TransportItinerary): Observable<TransportItinerary> {
    return this.http.post<TransportItinerary>(this.businessApiUrl, transportItinerary);
  }

  updateTransportItinerary(id: string, transportItinerary: TransportItinerary): Observable<TransportItinerary> {
    return this.http.put<TransportItinerary>(`${this.businessApiUrl}/${id}`, transportItinerary);
  }

  deleteTransportItinerary(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}

