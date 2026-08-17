import type { Timestamp } from "firebase/firestore";
import type { ExpenseCategory } from "@/src/constants/expense-categories";

export type SplitType = "equal" | "exact" | "percentage";

export type ExpenseParticipantShare = {
  userId: string;
  resolvedAmountMinor: number | null;
  exactAmountMinor: number | null;
  percentage: number | null;
};

export type ExpenseParticipants = Record<string, ExpenseParticipantShare>;

export type Expense = {
  id: string;
  name: string;
  amountMinor: number;
  amountScale: 2;
  category: ExpenseCategory;
  paidBy: string;
  participants: ExpenseParticipants;
  splitType: SplitType;
  date: Timestamp;
  note: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ExpenseFormValues = {
  name: string;
  amount: string;
  category: ExpenseCategory;
  paidBy: string;
  participantIds: string[];
  splitType: SplitType;
  date: string;
  note: string;
};
