import type { Timestamp } from "firebase/firestore";
import type { ExpenseCategory } from "@/src/constants/expense-categories";
import type { SplitType } from "@/src/lib/split-engine";

export type { SplitType };

export type ExpenseParticipantShare = {
  userId: string;
  resolvedAmountMinor: number;
  exactAmountMinor: number | null;
  percentageBasisPoints: number | null;
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
  exactAmounts: Record<string, string>;
  percentages: Record<string, string>;
  date: string;
  note: string;
};
