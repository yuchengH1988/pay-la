import { Timestamp } from "firebase/firestore";
import type { Expense } from "@/src/types/expense";
import type { Group } from "@/src/types/group";
import type { Settlement } from "@/src/types/settlement";
import type { UserProfileMap } from "@/src/types/user-profile";

export const demoCurrentUserId = "demo-you";

export const demoGroup: Group = {
  id: "demo-weekend-trip",
  name: "Weekend Trip",
  currency: "TWD",
  memberIds: [demoCurrentUserId, "demo-calvin", "demo-harry"],
  createdBy: demoCurrentUserId,
  createdAt: Timestamp.fromDate(new Date("2026-08-12T10:00:00+08:00")),
  updatedAt: Timestamp.fromDate(new Date("2026-08-27T12:00:00+08:00")),
};

export const demoMemberProfiles: UserProfileMap = {
  [demoCurrentUserId]: {
    id: demoCurrentUserId,
    displayName: "A User",
    shortName: "A User",
    email: "demo-you@payla.local",
    photoURL: null,
  },
  "demo-calvin": {
    id: "demo-calvin",
    displayName: "B User",
    shortName: "B User",
    email: "calvin@payla.local",
    photoURL: null,
  },
  "demo-harry": {
    id: "demo-harry",
    displayName: "C User",
    shortName: "C User",
    email: "harry@payla.local",
    photoURL: null,
  },
};

export const demoExpenses: Expense[] = [
  {
    id: "demo-expense-breakfast",
    name: "Breakfast",
    amountMinor: 30000,
    amountScale: 2,
    category: "food",
    paidBy: "demo-calvin",
    participants: {
      [demoCurrentUserId]: {
        userId: demoCurrentUserId,
        resolvedAmountMinor: 15000,
        exactAmountMinor: null,
        percentageBasisPoints: null,
      },
      "demo-calvin": {
        userId: "demo-calvin",
        resolvedAmountMinor: 15000,
        exactAmountMinor: null,
        percentageBasisPoints: null,
      },
    },
    splitType: "equal",
    date: Timestamp.fromDate(new Date("2026-08-27T09:30:00+08:00")),
    note: "Coffee and sandwiches before checkout.",
    createdBy: demoCurrentUserId,
  },
  {
    id: "demo-expense-dinner",
    name: "Dinner",
    amountMinor: 120000,
    amountScale: 2,
    category: "food",
    paidBy: demoCurrentUserId,
    participants: {
      [demoCurrentUserId]: {
        userId: demoCurrentUserId,
        resolvedAmountMinor: 40000,
        exactAmountMinor: null,
        percentageBasisPoints: 3334,
      },
      "demo-calvin": {
        userId: "demo-calvin",
        resolvedAmountMinor: 40000,
        exactAmountMinor: null,
        percentageBasisPoints: 3333,
      },
      "demo-harry": {
        userId: "demo-harry",
        resolvedAmountMinor: 40000,
        exactAmountMinor: null,
        percentageBasisPoints: 3333,
      },
    },
    splitType: "percentage",
    date: Timestamp.fromDate(new Date("2026-08-25T20:00:00+08:00")),
    note: "",
    createdBy: demoCurrentUserId,
  },
  {
    id: "demo-expense-taxi",
    name: "Taxi",
    amountMinor: 66000,
    amountScale: 2,
    category: "transport",
    paidBy: "demo-calvin",
    participants: {
      "demo-harry": {
        userId: "demo-harry",
        resolvedAmountMinor: 66000,
        exactAmountMinor: 66000,
        percentageBasisPoints: null,
      },
    },
    splitType: "exact",
    date: Timestamp.fromDate(new Date("2026-08-24T23:10:00+08:00")),
    note: "Late ride back to the hotel.",
    createdBy: "demo-calvin",
  },
];

export const demoSettlements: Settlement[] = [
  {
    id: "demo-settlement-calvin-you",
    payerId: "demo-calvin",
    receiverId: demoCurrentUserId,
    amountMinor: 20000,
    amountScale: 2,
    date: Timestamp.fromDate(new Date("2026-08-26T18:00:00+08:00")),
    note: "Partial repayment",
    createdBy: "demo-calvin",
  },
];
