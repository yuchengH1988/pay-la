import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/src/lib/firebase";
import {
  calculateSplit,
  type SplitErrorCode,
  type SplitParticipantInput,
} from "@/src/lib/split-engine";
import type {
  Expense,
  ExpenseFormValues,
  ExpenseParticipants,
} from "@/src/types/expense";

export class ExpenseSplitValidationError extends Error {
  constructor(public readonly codes: SplitErrorCode[]) {
    super("Expense split validation failed.");
  }
}

export function parseAmountToMinor(amount: string) {
  return parseMinorAmount(amount, { allowZero: false });
}

export function parseNonNegativeAmountToMinor(amount: string) {
  return parseMinorAmount(amount, { allowZero: true });
}

function parseMinorAmount(amount: string, { allowZero }: { allowZero: boolean }) {
  const trimmedAmount = amount.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
    return null;
  }

  const [major, minor = ""] = trimmedAmount.split(".");
  const amountMinor = Number(major) * 100 + Number(minor.padEnd(2, "0"));

  return Number.isSafeInteger(amountMinor) && (allowZero ? amountMinor >= 0 : amountMinor > 0)
    ? amountMinor
    : null;
}

export function parsePercentageToBasisPoints(percentage: string) {
  const trimmedPercentage = percentage.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(trimmedPercentage)) {
    return null;
  }

  const [whole, decimal = ""] = trimmedPercentage.split(".");
  const basisPoints = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

  return Number.isSafeInteger(basisPoints) && basisPoints >= 0
    ? basisPoints
    : null;
}

export function formatAmountFromMinor(amountMinor: number, currency: string) {
  return `${currency} ${(amountMinor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateForInput(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatExpenseDate(date: Timestamp) {
  return date.toDate().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toExpense(snapshot: QueryDocumentSnapshot<DocumentData>): Expense {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name,
    amountMinor: data.amountMinor,
    amountScale: data.amountScale,
    category: data.category,
    paidBy: data.paidBy,
    participants: data.participants,
    splitType: data.splitType,
    date: data.date,
    note: data.note,
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function buildExpensePayload(values: ExpenseFormValues) {
  const amountMinor = parseAmountToMinor(values.amount);

  if (!amountMinor) {
    throw new Error("Amount must be greater than 0.");
  }

  const splitParticipants = values.participantIds.map<SplitParticipantInput>((userId) => {
    if (values.splitType === "exact") {
      return {
        userId,
        exactAmountMinor: parseNonNegativeAmountToMinor(values.exactAmounts[userId] ?? ""),
      };
    }

    if (values.splitType === "percentage") {
      return {
        userId,
        percentageBasisPoints: parsePercentageToBasisPoints(
          values.percentages[userId] ?? "",
        ),
      };
    }

    return { userId };
  });
  const splitResult = calculateSplit({
    amountMinor,
    splitType: values.splitType,
    participants: splitParticipants,
  });

  if (!splitResult.ok) {
    throw new ExpenseSplitValidationError(splitResult.errors);
  }

  const participants = splitResult.shares.reduce<ExpenseParticipants>(
    (participantShares, share) => ({
      ...participantShares,
      [share.userId]: share,
    }),
    {},
  );

  return {
    name: values.name.trim(),
    amountMinor,
    amountScale: 2,
    category: values.category,
    paidBy: values.paidBy,
    participants,
    splitType: values.splitType,
    date: Timestamp.fromDate(new Date(`${values.date}T00:00:00`)),
    note: values.note.trim(),
    updatedAt: serverTimestamp(),
  };
}

export function subscribeToExpenses(
  groupId: string,
  onExpenses: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const expensesQuery = query(
    collection(firestore, "groups", groupId, "expenses"),
    orderBy("date", "desc"),
  );

  return onSnapshot(
    expensesQuery,
    (snapshot) => onExpenses(snapshot.docs.map(toExpense)),
    onError,
  );
}

export async function createExpense(
  groupId: string,
  userId: string,
  values: ExpenseFormValues,
) {
  const expenseRef = await addDoc(collection(firestore, "groups", groupId, "expenses"), {
    ...buildExpensePayload(values),
    createdBy: userId,
    createdAt: serverTimestamp(),
  });

  return expenseRef.id;
}

export async function updateExpense(
  groupId: string,
  expenseId: string,
  values: ExpenseFormValues,
) {
  await updateDoc(
    doc(firestore, "groups", groupId, "expenses", expenseId),
    buildExpensePayload(values),
  );
}

export async function deleteExpense(groupId: string, expenseId: string) {
  await deleteDoc(doc(firestore, "groups", groupId, "expenses", expenseId));
}
