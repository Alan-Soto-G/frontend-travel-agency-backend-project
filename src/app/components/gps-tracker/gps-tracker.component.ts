import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsService, GpsDevice } from '../../services/gps/gps.service';
import { WebsocketService, GpsUpdate } from '../../services/gps/websocket.service';
import { VehicleService } from 'src/app/services/models/business-models/vehicle.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-gps-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gps-tracker.component.html',
  styleUrls: ['./gps-tracker.component.scss']
})
export class GpsTrackerComponent implements OnInit, OnDestroy {
  map!: L.Map;
  markers = new Map<number, L.Marker>();
  
  vehicles = signal<any[]>([]);
  gpsDevices = signal<GpsDevice[]>([]);
  
  private wsSubscription?: Subscription;

  // Íconos personalizados
  private greenIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private greyIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    private gpsService: GpsService,
    private vehicleService: VehicleService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit() {
    this.initMap();
    this.loadVehicles();
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
    this.websocketService.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
    // Centrar en Manizales, Colombia
    this.map = L.map('map').setView([5.06889, -75.51738], 14);

    // Usar OpenStreetMap (gratis, sin API Key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
  }

  loadVehicles() {
    this.vehicleService.getVehicles().subscribe({
      next: (response: any) => {
        this.vehicles.set(response.data || response);
        this.loadGpsDevices();
      },
      error: (error) => {
        console.error('Error cargando vehículos:', error);
      }
    });
  }

  loadGpsDevices() {
    this.gpsService.getAllGps().subscribe({
      next: (response) => {
        this.gpsDevices.set(response.data);
        
        response.data.forEach(gps => {
          if (gps.latitude && gps.longitude) {
            this.createMarker(gps);
          }
        });

        this.subscribeToUpdates();
      },
      error: (error) => {
        console.error('Error cargando GPS:', error);
      }
    });
  }

  createMarker(gps: GpsDevice) {
    const vehicle = this.vehicles().find(v => v.id === gps.vehicleId);
    
    if (!gps.latitude || !gps.longitude) return;

    // Convertir a número
    const lat = Number(gps.latitude);
    const lng = Number(gps.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Coordenadas inválidas:', gps);
      return;
    }

    // Seleccionar ícono según estado
    let icon = this.greenIcon;
    if (gps.connectionStatus === 'offline') icon = this.greyIcon;
    if (gps.connectionStatus === 'error') icon = this.redIcon;

    // Crear marcador
    const marker = L.marker([lat, lng], { icon })
      .addTo(this.map)
      .bindPopup(this.getPopupContent(gps, vehicle));

    this.markers.set(gps.vehicleId, marker);
  }

  subscribeToUpdates() {
    const vehicleIds = this.gpsDevices().map(gps => gps.vehicleId);
    
    this.wsSubscription = this.websocketService
      .subscribeToAllVehicles(vehicleIds)
      .subscribe({
        next: (update: GpsUpdate) => {
          this.updateMarker(update);
        },
        error: (error) => {
          console.error('Error en WebSocket:', error);
        }
      });
  }

  updateMarker(update: GpsUpdate) {
    const marker = this.markers.get(update.vehicleId);
    const vehicle = this.vehicles().find(v => v.id === update.vehicleId);
    
    if (marker && update.latitude && update.longitude) {
      // Convertir a número
      const lat = Number(update.latitude);
      const lng = Number(update.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Animar el movimiento
        marker.setLatLng([lat, lng]);
        
        // Actualizar ícono según estado
        let icon = this.greenIcon;
        if (update.connectionStatus === 'offline') icon = this.greyIcon;
        if (update.connectionStatus === 'error') icon = this.redIcon;
        marker.setIcon(icon);

        // Actualizar popup
        const gps: GpsDevice = {
          id: 0,
          vehicleId: update.vehicleId,
          serialNumber: '',
          brand: '',
          model: '',
          isActive: true,
          latitude: lat,
          longitude: lng,
          speed: update.speed,
          lastLocationUpdate: update.timestamp,
          connectionStatus: update.connectionStatus,
        };
        marker.setPopupContent(this.getPopupContent(gps, vehicle));
      }
    }
  }

  centerOnVehicle(vehicleId: number) {
    console.log('Centrando en vehículo:', vehicleId);
    const marker = this.markers.get(vehicleId);
    
    if (marker) {
      const position = marker.getLatLng();
      this.map.setView(position, 17);
      marker.openPopup();
    } else {
      console.error('No se encontró marcador para vehículo:', vehicleId);
    }
  }

  centerAllVehicles() {
    console.log('Centrando todos los vehículos. Total marcadores:', this.markers.size);
    
    if (this.markers.size === 0) {
      console.warn('No hay marcadores para centrar');
      return;
    }

    const group = L.featureGroup(Array.from(this.markers.values()));
    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  getVehiclePlate(vehicleId: number): string {
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    return vehicle?.licensePlate || `Vehículo ${vehicleId}`;
  }

  getColorByStatus(status: string): string {
    switch (status) {
      case 'online': return '#10B981';
      case 'offline': return '#6B7280';
      case 'error': return '#EF4444';
      default: return '#3B82F6';
    }
  }

  getPopupContent(gps: GpsDevice, vehicle: any): string {
    return `
      <div style="padding: 10px; font-family: Arial, sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 16px;">
          ${vehicle?.licensePlate || `Vehículo ${gps.vehicleId}`}
        </h3>
        <p style="margin: 5px 0; color: #4B5563; font-size: 13px;">
          <strong>Marca:</strong> ${vehicle?.brand || 'N/A'}
        </p>
        <p style="margin: 5px 0; color: #4B5563; font-size: 13px;">
          <strong>Modelo:</strong> ${vehicle?.model || 'N/A'}
        </p>
        <p style="margin: 5px 0; color: #4B5563; font-size: 13px;">
          <strong>Velocidad:</strong> ${gps.speed ? `${gps.speed} km/h` : 'N/A'}
        </p>
        <p style="margin: 5px 0; color: #4B5563; font-size: 13px;">
          <strong>Estado:</strong> 
          <span style="color: ${this.getColorByStatus(gps.connectionStatus)}; font-weight: bold;">
            ${gps.connectionStatus.toUpperCase()}
          </span>
        </p>
        <p style="margin: 5px 0; font-size: 11px; color: #9CA3AF;">
          Última actualización: ${gps.lastLocationUpdate ? new Date(gps.lastLocationUpdate).toLocaleString() : 'N/A'}
        </p>
      </div>
    `;
  }
}