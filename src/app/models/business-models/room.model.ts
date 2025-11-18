export interface Room {
  id: number
  hotelId: number
  roomNumber: string
  roomType: string
  capacity: number
  pricePerNight: number
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  createdAt: string
  updatedAt: string
}

