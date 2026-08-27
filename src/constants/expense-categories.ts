export const expenseCategories = [
  "food",
  "groceries",
  "transport",
  "housing",
  "utilities",
  "entertainment",
  "shopping",
  "travel",
  "health",
  "education",
  "subscriptions",
  "pets",
  "gifts",
  "insurance",
  "other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];
