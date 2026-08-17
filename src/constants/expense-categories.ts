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

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  food: "Food",
  groceries: "Groceries",
  transport: "Transport",
  housing: "Housing",
  utilities: "Utilities",
  entertainment: "Entertainment",
  shopping: "Shopping",
  travel: "Travel",
  health: "Health",
  education: "Education",
  subscriptions: "Subscriptions",
  pets: "Pets",
  gifts: "Gifts",
  insurance: "Insurance",
  other: "Other",
};
