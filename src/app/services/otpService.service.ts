import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar operaciones de OTP (One-Time Password) contra la API REST.
 * Proporciona métodos para generar, validar, guardar y eliminar códigos OTP.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({ providedIn: 'root' })
export class OtpServiceService {
  /**
   * URL base de la API para OTP.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}public/otp`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Genera un código OTP aleatorio de 4 dígitos y lo envía por email.
   * El código se guarda automáticamente en el backend.
   * @param email Dirección de correo electrónico del destinatario
   * @returns Observable con el código OTP generado (solo para pruebas)
   */
  generateOtp(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/generate/${email}`, null, {
      responseType: 'text'
    });
  }

  /**
   * Guarda un código OTP personalizado para un destinatario específico.
   * @param emailOrPhone Email o número de teléfono del destinatario
   * @param code Código OTP a guardar
   * @returns Observable vacío cuando la operación es exitosa
   */
  saveOtp(emailOrPhone: string, code: string): Observable<void> {
    const params = new HttpParams()
      .set('emailOrPhone', emailOrPhone)
      .set('code', code);
    return this.http.post<void>(`${this.apiUrl}/save`, null, { params });
  }

  /**
   * Recupera el código OTP actualmente almacenado para un destinatario.
   * @param emailOrPhone Email o número de teléfono del destinatario
   * @returns Observable con el código OTP si existe
   */
  getOtp(emailOrPhone: string): Observable<string> {
    const params = new HttpParams().set('emailOrPhone', emailOrPhone);
    return this.http.get(`${this.apiUrl}/get`, {
      params,
      responseType: 'text'
    });
  }

  /**
   * Elimina el código OTP almacenado para un destinatario específico.
   * @param emailOrPhone Email o número de teléfono del destinatario
   * @returns Observable vacío cuando la operación es exitosa
   */
  deleteOtp(emailOrPhone: string): Observable<void> {
    const params = new HttpParams().set('emailOrPhone', emailOrPhone);
    return this.http.delete<void>(`${this.apiUrl}/delete`, { params });
  }

  /**
   * Valida un código OTP proporcionado contra el código almacenado.
   * @param emailOrPhone Email o número de teléfono del destinatario
   * @param code Código OTP a validar
   * @returns Observable con true si el código es válido, false en caso contrario
   */
  validateOtp(emailOrPhone: string, code: string): Observable<boolean> {
    const params = new HttpParams()
      .set('emailOrPhone', emailOrPhone)
      .set('code', code);
    return this.http.post<boolean>(`${this.apiUrl}/validate`, null, { params });
  }
}
