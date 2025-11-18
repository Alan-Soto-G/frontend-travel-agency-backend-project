import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TouristActivity } from 'src/app/models/business-models/tourist-activity.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TouristActivityService {
  private businessApiUrl = `${environment.businessApiUrl}tourist-activities`;

  constructor(private http: HttpClient) {}

  getTouristActivities(): Observable<TouristActivity[]> {
    return this.http.get<TouristActivity[]>(this.businessApiUrl);
  }

  getTouristActivityById(id: string): Observable<TouristActivity> {
    return this.http.get<TouristActivity>(`${this.businessApiUrl}/${id}`);
  }

  createTouristActivity(activity: TouristActivity): Observable<TouristActivity> {
    return this.http.post<TouristActivity>(this.businessApiUrl, activity);
  }

  updateTouristActivity(id: string, activity: TouristActivity): Observable<TouristActivity> {
    return this.http.put<TouristActivity>(`${this.businessApiUrl}/${id}`, activity);
  }

  deleteTouristActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}

