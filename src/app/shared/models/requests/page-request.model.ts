export interface PageRequest {
      page?: number;
      size?: number;
      search?: string;
      sortColumn?: string;
      sortType?: 'asc' | 'desc';
}
