export interface Invoice {
  id: number;
  feeId: number;
  bankCardId: number; 
  invoiceNumber: string;
  totalAmount: number;
  issueDate: string;
  paymentDate: string | null;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
