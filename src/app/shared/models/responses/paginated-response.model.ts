export interface PaginatedResponse<T> {
      content: T[];
      pageable: Pageable;
      last: boolean;
      totalPages: number;
      totalElements: number;
      size: number;
      number: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      first: boolean;
      numberOfElements: number;
      empty: boolean;
}


export interface Pageable {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
}