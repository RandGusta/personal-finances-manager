export type CategoryType = "INCOME" | "EXPENSE";

export interface CategoryResponse {
  id: number;
  name: string;
  type: CategoryType;
}
