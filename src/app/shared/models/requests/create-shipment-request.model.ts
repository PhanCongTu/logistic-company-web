export interface CreateShipmentRequest {
      name: string;
      recipientAddress: string;
      recipientLatitude: number;
      recipientLongitude: number;
      pickUpAddress: string;
      pickUpLatitude: number;
      pickUpLongitude: number;
      senderName: string;
      senderPhone: string;
      recipientPhone: string;
      recipientName: string;
      notes?: string;
}
