import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GpsUpdate {
  vehicleId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  timestamp: string;
  connectionStatus: string;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket: any = null;

  connect() {
    if (!this.socket) {
      const baseUrl = environment.businessApiUrl.replace('/api/', '');
      
      import('socket.io-client').then((module) => {
        // Llamar directamente a la función default
        this.socket = module.default(baseUrl, {
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          console.log('✅ WebSocket conectado');
        });

        this.socket.on('disconnect', () => {
          console.log('❌ WebSocket desconectado');
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('❌ Error de conexión WebSocket:', error);
        });
      }).catch((error) => {
        console.error('Error importando socket.io-client:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToVehicle(vehicleId: number): Observable<GpsUpdate> {
    return new Observable((observer) => {
      if (!this.socket) {
        this.connect();
        setTimeout(() => this.setupSubscription(vehicleId, observer), 1000);
      } else {
        this.setupSubscription(vehicleId, observer);
      }

      return () => {
        const channel = `gps/vehicle/${vehicleId}`;
        this.socket?.off(channel);
      };
    });
  }

  private setupSubscription(vehicleId: number, observer: any) {
    const channel = `gps/vehicle/${vehicleId}`;
    this.socket?.on(channel, (data: GpsUpdate) => {
      observer.next(data);
    });
  }

  subscribeToAllVehicles(vehicleIds: number[]): Observable<GpsUpdate> {
    return new Observable((observer) => {
      if (!this.socket) {
        this.connect();
        setTimeout(() => {
          vehicleIds.forEach((vehicleId) => {
            const channel = `gps/vehicle/${vehicleId}`;
            this.socket?.on(channel, (data: GpsUpdate) => {
              observer.next(data);
            });
          });
        }, 1000);
      } else {
        vehicleIds.forEach((vehicleId) => {
          const channel = `gps/vehicle/${vehicleId}`;
          this.socket?.on(channel, (data: GpsUpdate) => {
            observer.next(data);
          });
        });
      }

      return () => {
        vehicleIds.forEach((vehicleId) => {
          this.socket?.off(`gps/vehicle/${vehicleId}`);
        });
      };
    });
  }
}