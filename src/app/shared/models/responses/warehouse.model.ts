export interface Warehouse {
      id: number;
      name: string;
      address: string;
      status: boolean;
      latitude: number;
      longitude: number;
      managerIds: Array<number>;
      managerUsernames: Array<string>;
}
