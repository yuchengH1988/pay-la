import type { Timestamp } from "firebase/firestore";

export type Settlement = {
  id: string;
  payerId: string;
  receiverId: string;
  amountMinor: number;
  amountScale: 2;
  date: Timestamp;
  note: string;
  createdBy: string;
  createdAt?: Timestamp;
};

export type SettlementFormValues = {
  payerId: string;
  receiverId: string;
  amount: string;
  date: string;
  note: string;
};
