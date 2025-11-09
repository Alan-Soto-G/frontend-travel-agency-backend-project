import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankCard } from 'src/app/models/business-models/bank-card.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class BankCardService {
  private businessApiUrl = `${environment.businessApiUrl}bank-cards`;

  constructor(private http: HttpClient) {}

  getBankCards(): Observable<BankCard[]> {
    return this.http.get<BankCard[]>(this.businessApiUrl);
  }

  getBankCardById(id: string): Observable<BankCard> {
    return this.http.get<BankCard>(`${this.businessApiUrl}/${id}`);
  }

  createBankCard(bankCard: BankCard): Observable<BankCard> {
    return this.http.post<BankCard>(this.businessApiUrl, bankCard);
  }

  updateBankCard(id: string, bankCard: BankCard): Observable<BankCard> {
    return this.http.put<BankCard>(`${this.businessApiUrl}/${id}`, bankCard);
  }

  deleteBankCard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.businessApiUrl}/${id}`);
  }
}
