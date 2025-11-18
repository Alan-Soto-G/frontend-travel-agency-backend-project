import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from 'src/app/models/business-models/room.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private businessApiUrl = `${environment.businessApiUrl}rooms`;

  constructor(private http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.businessApiUrl);
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.businessApiUrl}/${id}`);
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.businessApiUrl, room);
  }

  updateRoom(id: string, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.businessApiUrl}/${id}`, room);
  }

  deleteRoom(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}

