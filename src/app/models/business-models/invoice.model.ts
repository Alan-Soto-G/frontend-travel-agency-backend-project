export interface Invoice {
  id: number
  feeId: number
  invoiceNumber: string
  totalAmount: number
  issueDate: string        // DateTime → string ISO
  paymentDate: string      // DateTime → string ISO
  paymentMethod: string
  createdAt: string
  updatedAt: string
}
