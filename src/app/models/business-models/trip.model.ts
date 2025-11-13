export interface Trip {
  id: number
  name: string
  description?: string
  destination: string
  startDate: string        // DateTime en Adonis → string ISO en Angular
  endDate: string          // DateTime en Adonis → string ISO en Angular
  price: number
  capacity: number
  availableSeats: number
  status: string
}
