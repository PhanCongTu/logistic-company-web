export interface UserProfile {
      userId: string;
      username?: string;
      emailAddress?: string;
      newEmailAddress?: string;
      isEmailAddressVerified?: boolean;
      address?: string;
      latitude?: string;
      longitude?: string;
      roles?: string[];
      warehouseId?: string;
}
