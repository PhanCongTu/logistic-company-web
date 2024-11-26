export class AppConstants {
      static readonly PASSWORD_REGEX: RegExp = /^[!-~]{8,20}$/;
      static readonly LOGIN_NAME_REGEX: RegExp = /^([a-zA-Z0-9._-]{6,16}$)/;
      static readonly EMAIL_REGEX: RegExp = /^[a-zA-Z0-9\+\.\_\%\-\+]{1,256}\@[a-zA-Z0-9][a-zA-Z0-9\-]{0,62}(\.[a-zA-Z0-9][a-zA-Z0-9\-]{0,25})+$/;
}

export enum ROLES {
      ROLE_ADMIN = "ROLE_ADMIN",
      ROLE_USER = "ROLE_USER",
      ROLE_WAREHOUSE_MANAGER = "ROLE_WAREHOUSE_MANAGER"
}

export enum SHIPMENT_STATUS {
      ORDER_RECEIVED = "ORDER_RECEIVED",
      PICKUP_SCHEDULED = "PICKUP_SCHEDULED",
      OUT_FOR_PICKUP = "OUT_FOR_PICKUP",
      PICKED_UP = "PICKED_UP",
      IN_TRANSIT = "IN_TRANSIT",
      TRANSITED = "TRANSITED",
      OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
      DELIVERED = "DELIVERED",
      DELIVERED_FAILED = "DELIVERED_FAILED",
      RETURNED = "RETURNED",
      CANCELED = "CANCELED",
}
