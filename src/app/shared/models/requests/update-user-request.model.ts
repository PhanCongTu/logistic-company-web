import { CoordinatesWithAddress } from "../common/coordinates.model";

export interface UpdateUserRequest {
      emailAddress?: string; // null allowed
      phoneNumber?: string; // null allowed
      coordinatesWithAddress?: CoordinatesWithAddress // null allowed
}
