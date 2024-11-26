export interface CreateShipmentRequest {
      name: string;
      recipientAddress: string;
      recipientLatitude: number;
      recipientLongitude: number;
      pickUpAddress: string;
      pickUpLatitude: number;
      pickUpLongitude: number;
      recipientPhone: string;
      recipientName: string;
      notes?: string;
}
