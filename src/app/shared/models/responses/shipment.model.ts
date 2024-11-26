export interface Shipment {
      id: number;
      name: string;
      code: string;
      pickUpAddress: string;
      pickUpLatitude: number;
      pickUpLongitude: number;
      recipientAddress: string;
      recipientLatitude: number;
      recipientLongitude: number;
      recipientName: string;
      recipientPhone: string;
      estimatedDelivery: string;
      actualDelivery: string;
      notes: string;
      needToPay: string;
      status: string;
      userId: number;
      pickerId: number;
      deliveryPersonId: number;
}
