export interface TripClient {
  tripId: number;
  clientId: number;
  travelers: number;
  quantity: number;
  installments: number;
  totalAmount: number;
  totalWithInterest: number;
  interestRate: number;
  paymentStatus?: 'pending' | 'processing' | 'partial' | 'completed' | 'cancelled' | 'refunded';
}