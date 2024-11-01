import { CoordinatesWithAddress } from "./coordinates.model";

export interface UpdateUser {
      emailAddress?: string ; // null allowed
      coordinatesWithAddress?: CoordinatesWithAddress // null allowed
}
