import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interfaces para los datos de reportes
 */
export interface RevenueHistoryItem {
  date: string;
  revenue: number;
}

export interface MunicipalityTrip {
  municipalityId: number;
  municipalityName: string;
  tripCount: number;
}

export interface TransportDistribution {
  type: 'aereo' | 'terrestre';
  count: number;
  percentage: number;
}

export interface DashboardData {
  revenueHistory: RevenueHistoryItem[];
  municipalityTrips: MunicipalityTrip[];
  transportDistribution: TransportDistribution[];
}

export interface Statistics {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  totalRevenue: number;
  averageTripPrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Servicio para gestionar los reportes y estadísticas del negocio.
 * Consume endpoints del microservicio de negocio (AdonisJS).
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  /**
   * URL base de la API de reportes del microservicio de negocio.
   * Utiliza businessApiUrl configurada en environment.
   */
  private readonly apiUrl = `${environment.businessApiUrl}reports`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los datos del dashboard en una sola petición.
   * Incluye histórico de ingresos, viajes por municipio y distribución de transporte.
   * @returns Observable con los datos del dashboard
   */
  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Obtiene las estadísticas generales del sistema.
   * Incluye total de viajes, viajes activos, completados, ingresos totales y precio promedio.
   * @returns Observable con las estadísticas
   */
  getStatistics(): Observable<ApiResponse<Statistics>> {
    return this.http.get<ApiResponse<Statistics>>(`${this.apiUrl}/statistics`);
  }

  /**
   * Obtiene el histórico de ingresos por mes.
   * @returns Observable con el histórico de ingresos
   */
  getRevenueHistory(): Observable<ApiResponse<RevenueHistoryItem[]>> {
    return this.http.get<ApiResponse<RevenueHistoryItem[]>>(`${this.apiUrl}/revenue-history`);
  }

  /**
   * Obtiene la cantidad de viajes por municipio.
   * @returns Observable con los viajes por municipio
   */
  getMunicipalityTrips(): Observable<ApiResponse<MunicipalityTrip[]>> {
    return this.http.get<ApiResponse<MunicipalityTrip[]>>(`${this.apiUrl}/municipality-trips`);
  }

  /**
   * Obtiene la distribución de tipos de transporte (aéreo vs terrestre).
   * @returns Observable con la distribución de transporte
   */
  getTransportDistribution(): Observable<ApiResponse<TransportDistribution[]>> {
    return this.http.get<ApiResponse<TransportDistribution[]>>(`${this.apiUrl}/transport-distribution`);
  }

  /**
   * Obtiene los top N destinos más visitados.
   * @param limit Cantidad máxima de destinos a retornar (por defecto 5)
   * @returns Observable con los destinos más populares
   */
  getTopDestinations(limit: number = 5): Observable<ApiResponse<MunicipalityTrip[]>> {
    return this.http.get<ApiResponse<MunicipalityTrip[]>>(`${this.apiUrl}/top-destinations?limit=${limit}`);
  }

  /**
   * Obtiene los ingresos mensuales del año actual.
   * @returns Observable con los ingresos mensuales
   */
  getMonthlyRevenue(): Observable<ApiResponse<RevenueHistoryItem[]>> {
    return this.http.get<ApiResponse<RevenueHistoryItem[]>>(`${this.apiUrl}/monthly-revenue`);
  }
}

