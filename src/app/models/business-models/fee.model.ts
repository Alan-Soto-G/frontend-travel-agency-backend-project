export interface Fee {
  id: number
  tripId: number
  amount: number
  description: string
  dueDate: string          // DateTime → string ISO
  status: 'pending' | 'paid' | 'overdue'
  createdAt: string
  updatedAt: string
}
