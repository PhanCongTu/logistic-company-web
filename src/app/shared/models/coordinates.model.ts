export interface Coordinates {
      lat: number;
      lng: number;
}
export interface CoordinatesWithAddress extends Coordinates {
  address: string;
}

export function isCoordinates(data: any): data is Coordinates {
      return (
        data &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      );
    }