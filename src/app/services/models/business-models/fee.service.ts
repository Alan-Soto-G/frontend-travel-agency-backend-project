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

  createFee(fee: Fee): Observable<Fee> {
    return this.http.post<Fee>(this.businessApiUrl, fee);
  }

  updateFee(id: string, fee: Fee): Observable<Fee> {
    return this.http.put<Fee>(`${this.businessApiUrl}/${id}`, fee);
  }

  deleteFee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}
