import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from 'src/app/models/business-models/plan.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private businessApiUrl = `${environment.businessApiUrl}plans`;

  constructor(private http: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.businessApiUrl);
  }

  getPlanById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.businessApiUrl}/${id}`);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.businessApiUrl, plan);
  }

  updatePlan(id: string, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.businessApiUrl}/${id}`, plan);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}

