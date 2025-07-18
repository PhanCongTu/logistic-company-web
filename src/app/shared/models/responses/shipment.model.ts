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
      senderName: string;
      senderPhone: string;
      recipientName: string;
      recipientPhone: string;
      estimatedDelivery: string;
      actualDelivery: string;
      notes: string;
      needToPay: string;
      isPaid: boolean;
      status: string;
      username: string;
      pickerUsername: string;
      deliveryPersonUsername: string;
      returnedPickerUsername: string;
      returnedDeliveryPersonUsername: string;
      destinationWarehouseId: Number;
      destinationWarehouseAddress: string;
      originWarehouseId: Number;
      originWarehouseAddress: string;
      transporterUsername: string;
}
