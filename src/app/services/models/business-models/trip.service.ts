import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../../../models/business-models/trip.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TripService {
  private businessApiUrl = `${environment.businessApiUrl}trips`;

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.businessApiUrl);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.businessApiUrl}/${id}`);
  }

  createTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.businessApiUrl, trip);
  }

  updateTrip(id: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.businessApiUrl}/${id}`, trip);
  }

  deleteTrip(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}
