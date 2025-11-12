export interface BankCard {
  id: number
  clientId: number
  cardNumber: string
  cvv: string
  expirationDate: string     // DateTime → string ISO
  cardHolderName: string
  createdAt: string
  updatedAt: string
}
