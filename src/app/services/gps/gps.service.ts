import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface GpsLocation {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  lastUpdate: string | null;
  connectionStatus: string;
}

export interface GpsDevice {
  id: number;
  vehicleId: number;
  serialNumber: string;
  brand: string;
  model: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  lastLocationUpdate: string | null;
  connectionStatus: string;
  vehicle?: any;
}

@Injectable({ providedIn: 'root' })
export class GpsService {
  private apiUrl = `${environment.businessApiUrl}gps`;

  constructor(private http: HttpClient) {}

  getAllGps(): Observable<{ message: string; data: GpsDevice[] }> {
    return this.http.get<{ message: string; data: GpsDevice[] }>(this.apiUrl);
  }

  getVehicleLocation(vehicleId: number): Observable<{ message: string; data: GpsLocation }> {
    return this.http.get<{ message: string; data: GpsLocation }>(
      `${this.apiUrl}/vehicle/${vehicleId}/location`
    );
  }
}