import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

// Declarar el objeto global de ePayco
declare var ePayco: any;

export interface PaymentData {
  name: string;
  description: string;
  invoice: string;
  currency: string;
  amount: string;
  tax_base: string;
  tax: string;
  country: string;
  lang: string;
  external: string;
  extra1?: string;
  extra2?: string;
  extra3?: string;
  confirmation?: string;
  response?: string;
  emailBill?: string;
  nameBill?: string;
  addressBill?: string;
  typePerson?: number;
  docType?: string;
  docNumber?: string;
  cellPhone?: string;
  dues?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EpaycoService {
  private handler: any;

  constructor() {
    this.initializeHandler();
  }

  private initializeHandler(): void {
    if (typeof ePayco !== 'undefined') {
      this.handler = ePayco.checkout.configure({
        key: environment.epayco.publicKey,
        test: environment.epayco.test  
      });
    } else {
      console.error('ePayco script no está cargado');
    }
  }

  openCheckout(paymentData: PaymentData): void {
    if (!this.handler) {
      this.initializeHandler();
    }

    if (this.handler) {
      this.handler.open(paymentData);
    } else {
      console.error('No se pudo inicializar el handler de ePayco');
    }
  }

  generateInvoiceNumber(): string {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}