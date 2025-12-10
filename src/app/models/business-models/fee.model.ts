export interface Fee {
  id: number
  tripClientId: number
  amount: number
  description: string
  dueDate: string          // DateTime → string ISO
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  createdAt: string
  updatedAt: string
}
