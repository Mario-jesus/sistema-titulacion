export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginationResult {
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export function buildPagination(params: PaginationParams): PaginationResult {
  const { page, limit, total } = params;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * limit;
  const pagingCounter = total > 0 ? offset + 1 : 0;

  return {
    total,
    limit,
    totalPages,
    page: currentPage,
    pagingCounter,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
  };
}

export function parsePaginationQuery(query: {
  page?: string | number;
  limit?: string | number;
}): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(query.limit || 10), 10) || 10)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
