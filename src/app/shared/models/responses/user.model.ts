export interface User {
      userId?: string;
      username?: string;
      emailAddress?: string;
      phoneNumber?: string;
      newEmailAddress?: string;
      isEmailAddressVerified?: boolean;
      address?: string;
      accessToken?: string;
      refreshToken?: string;
      roles?: string[];
      expired_in?: string;
      warehouseId?: number;
}
