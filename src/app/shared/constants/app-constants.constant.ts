export class AppConstants {
      static readonly PASSWORD_REGEX: RegExp = /^[!-~]{8,20}$/;
      static readonly LOGIN_NAME_REGEX: RegExp = /^([a-zA-Z0-9._-]{6,16}$)/;
      static readonly EMAIL_REGEX: RegExp = /^[a-zA-Z0-9\+\.\_\%\-\+]{1,256}\@[a-zA-Z0-9][a-zA-Z0-9\-]{0,62}(\.[a-zA-Z0-9][a-zA-Z0-9\-]{0,25})+$/;
}

export enum ROLES {
      ROLE_ADMIN = "ROLE_ADMIN",
      ROLE_USER = "ROLE_USER",
}
