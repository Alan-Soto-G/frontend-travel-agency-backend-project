export interface Trip {
  id: number
  startDate: string        // DateTime en Adonis → string ISO en Angular
  endDate: string          // DateTime en Adonis → string ISO en Angular
  destination: string
  createdAt: string        // timestamps → string ISO
  updatedAt: string
}
