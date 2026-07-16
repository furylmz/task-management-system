export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  validationErrors?: Record<string, string[]>;
}