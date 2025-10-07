import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Servicio para gestionar el envío de correos electrónicos a través de la API REST.
 * Proporciona métodos para enviar correos con diferentes configuraciones.
 * Utiliza HttpClient para realizar peticiones HTTP al backend.
 */
@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la aplicación
})
export class MailService {
  /**
   * URL base de la API para envío de correos.
   * Se obtiene desde las variables de entorno.
   */
  private apiUrl = `${environment.apiUrl}public/email`;

  /**
   * Inyecta el cliente HTTP para realizar peticiones al backend.
   * @param http Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {}

  /**
   * Envía un correo electrónico simple con asunto y cuerpo.
   * @param recipients Array de direcciones de correo de destinatarios
   * @param subject Asunto del correo
   * @param content Cuerpo del correo (puede ser HTML)
   * @param is_Html Indica si el contenido es HTML (true) o texto plano (false)
   * @returns Observable con el mensaje de respuesta del servidor
   */
  sendMail(recipients: string[], subject: string, content: string, is_Html: boolean): Observable<any> {
    const mailData = { recipients, subject, content, isHtml: is_Html };
    return this.http.post(`${this.apiUrl}`, mailData, { responseType: 'text' });
  }
}
