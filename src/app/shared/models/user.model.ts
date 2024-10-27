export interface User {
      userId: string;
      username: string;
      emailAddress: string;
      isEmailAddressVerified: boolean;
      accessToken: string;
      refreshToken: string;
      roles: string[];
      expired_in: string;
}
