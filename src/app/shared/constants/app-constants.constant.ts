export class AppConstants {
      static readonly PASSWORD_REGEX: RegExp = /^[!-~]{8,20}$/;
      static readonly LOGIN_NAME_REGEX: RegExp = /^([a-zA-Z0-9._-]{6,16}$)/;
      static readonly EMAIL_REGEX: RegExp = /^[a-zA-Z0-9\+\.\_\%\-\+]{1,256}\@[a-zA-Z0-9][a-zA-Z0-9\-]{0,62}(\.[a-zA-Z0-9][a-zA-Z0-9\-]{0,25})+$/;
      static readonly PHONE_NUMBER_REGEX: RegExp = /^(?:\+?(\d{1,3}))?[-. (]?(\d{3})[-. )]?(\d{3})[-. ]?(\d{4})$/;
}

export enum ROLES {
      ROLE_ADMIN = "ROLE_ADMIN",
      ROLE_USER = "ROLE_USER",
      ROLE_WAREHOUSE_MANAGER = "ROLE_WAREHOUSE_MANAGER",
      ROLE_SHIPPER = "ROLE_SHIPPER",
      ROLE_TRANSPORTER = "ROLE_TRANSPORTER"
}

export enum SHIPMENT_STATUS {
      ORDER_RECEIVED = "ORDER_RECEIVED",
      PICKUP_SCHEDULED = "PICKUP_SCHEDULED",
      OUT_FOR_PICKUP = "OUT_FOR_PICKUP",
      PICKED_UP = "PICKED_UP",
      TRANSIT_SCHEDULED = "TRANSIT_SCHEDULED",
      IN_TRANSIT = "IN_TRANSIT",
      TRANSITED = "TRANSITED",
      DELIVERY_SCHEDULED = "DELIVERY_SCHEDULED",
      OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
      DELIVERED = "DELIVERED",
      DELIVERED_FAILED = "DELIVERED_FAILED",
      RETURNED = "RETURNED",
      CANCELED = "CANCELED",
}

export enum SHIPPER_TYPE {
      PICKER = "PICKER",
      DELIVERY = "DELIVERY",
      RETURNED_PICKER = "RETURNED_PICKER",
      RETURNED_DELIVERY = "RETURNED_DELIVERY",
}

export enum TRANSPORTER_TYPE {
      TRANSPORTER = "TRANSPORTER",
      RETURNED_TRANSPORTER = "RETURNED_TRANSPORTER"
}
