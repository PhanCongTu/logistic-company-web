import { HttpParams } from '@angular/common/http';

export class RequestParamBuilder {
  private params: { [key: string]: string | number } = {};

  private defaultPageNumber = 0;
  private defaultPageSize = 10;
  private defaultSearch = '';
  private defaultSortColumn = 'id';
  private defaultSortType: 'asc' | 'desc' = 'asc';

  constructor() {
    this.setPage(this.defaultPageNumber)
      .setSize(this.defaultPageSize)
      .setSearch(this.defaultSearch)
      .setSortColumn(this.defaultSortColumn)
      .setSortType(this.defaultSortType);
  }

  setPage(pageNumber?: number): this {
    if (pageNumber !== undefined) {
      this.params['pageNumber'] = pageNumber;
    }
    return this;
  }

  setSize(pageSize?: number): this {
    if (pageSize !== undefined) {
      this.params['pageSize'] = pageSize;
    }
    return this;
  }

  setSearch(search?: string): this {
    if (search !== undefined) {
      this.params['search'] = search;
    }
    return this;
  }

  setSortColumn(sortColumn?: string): this {
    if (sortColumn !== undefined) {
      this.params['sortColumn'] = sortColumn;
    }
    return this;
  }

  setSortType(sortType?: 'asc' | 'desc'): this {
    if (sortType !== undefined) {
      this.params['sortType'] = sortType;
    }
    return this;
  }

  build(): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(this.params).forEach((key) => {
      httpParams = httpParams.append(key, this.params[key].toString());
    });
    return httpParams;
  }
}
