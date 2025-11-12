import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from 'src/app/models/business-models/invoice.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private businessApiUrl = `${environment.businessApiUrl}invoices`;

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.businessApiUrl);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.businessApiUrl}/${id}`);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.businessApiUrl, invoice);
  }

  updateInvoice(id: string, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.businessApiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}
