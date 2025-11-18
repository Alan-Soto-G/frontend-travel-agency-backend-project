import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Journey } from 'src/app/models/business-models/journey.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class JourneyService {
  private businessApiUrl = `${environment.businessApiUrl}journeys`;

  constructor(private http: HttpClient) {}

  getJourneys(): Observable<Journey[]> {
    return this.http.get<Journey[]>(this.businessApiUrl);
  }

  getJourneyById(id: string): Observable<Journey> {
    return this.http.get<Journey>(`${this.businessApiUrl}/${id}`);
  }

  createJourney(journey: Journey): Observable<Journey> {
    return this.http.post<Journey>(this.businessApiUrl, journey);
  }

  updateJourney(id: string, journey: Journey): Observable<Journey> {
    return this.http.put<Journey>(`${this.businessApiUrl}/${id}`, journey);
  }

  deleteJourney(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}

