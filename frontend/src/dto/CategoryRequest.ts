import type { CategoryType } from "./CategoryResponse";

export interface CategoryRequest {
  name: string;
  type: CategoryType;
  color?: string;
}
