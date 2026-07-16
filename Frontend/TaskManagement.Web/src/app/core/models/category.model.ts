export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  color: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string | null;
  color: string;
}