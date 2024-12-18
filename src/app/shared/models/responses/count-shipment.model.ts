export interface CountShipment {
      DELIVERY_SCHEDULED: number
      DELIVERED: number;
      DELIVERED_FAILED: number;
      OUT_FOR_PICKUP: number;
      TRANSIT_SCHEDULED: number;
      IN_TRANSIT: number;
      TRANSITED: number;
      RETURNED: number;
      PICKUP_SCHEDULED: number;
      CANCELED: number;
      ORDER_RECEIVED: number;
      PICKED_UP: number;
      OUT_FOR_DELIVERY: number;

      ORIGIN_TRANSIT_SCHEDULED: number;
      ORIGIN_IN_TRANSIT: number;
      ORIGIN_TRANSITED: number;
      DESTINATION_TRANSIT_SCHEDULED: number;
      DESTINATION_IN_TRANSIT: number;
      DESTINATION_TRANSITED: number;
}
