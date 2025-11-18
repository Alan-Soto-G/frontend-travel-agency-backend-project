export interface TouristActivity {
  id: number
  municipalityId: number
  name: string
  description?: string
  price?: number
  duration?: number
  category?: 'cultural' | 'adventure' | 'gastronomic' | 'recreational' | 'ecological' | 'aquatic' | 'other'
  createdAt: string
  updatedAt: string
}

