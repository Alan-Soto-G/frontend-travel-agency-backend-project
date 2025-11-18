// transportation-service.interface.ts
export interface TransportationService {
  id: number;
  journeyId: number;
  vehicleId: number;
  startDate: string ;
  endDate: string ;
  cost: number;
}