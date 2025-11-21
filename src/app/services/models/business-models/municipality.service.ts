import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Municipality } from 'src/app/models/business-models/municipality';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MunicipalityService {
  private businessApiUrl = `${environment.businessApiUrl}municipalities`;

  constructor(private http: HttpClient) {}

  getMunicipalities(): Observable<Municipality[]> {
    return this.http.get<Municipality[]>(this.businessApiUrl);
  }

  getMunicipalityById(id: string): Observable<Municipality> {
    return this.http.get<Municipality>(`${this.businessApiUrl}/${id}`);
  }

  createMunicipality(municipality: Municipality): Observable<Municipality> {
    console.log('📦 Datos enviados al backend:', municipality);
    return this.http.post<Municipality>(this.businessApiUrl, municipality);
  }

  updateMunicipality(id: string, municipality: Municipality): Observable<Municipality> {
    return this.http.put<Municipality>(`${this.businessApiUrl}/${id}`, municipality);
  }

  deleteMunicipality(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}