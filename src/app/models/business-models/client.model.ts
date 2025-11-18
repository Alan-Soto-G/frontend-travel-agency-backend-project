export interface Client {
  id: number
  userId: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  allergies?: string
  loyaltyPoints?: number
  isVip?: boolean
  createdAt: string
  updatedAt: string
}
