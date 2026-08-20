import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/src/lib/firebase";
import { validateSettlementInput } from "@/src/lib/settlement-validation";
import type { Group } from "@/src/types/group";
import type { Settlement, SettlementFormValues } from "@/src/types/settlement";
import { parseAmountToMinor } from "./expenses";

function toSettlement(snapshot: QueryDocumentSnapshot<DocumentData>): Settlement {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    payerId: data.payerId,
    receiverId: data.receiverId,
    amountMinor: data.amountMinor,
    amountScale: data.amountScale,
    date: data.date,
    note: data.note,
    createdBy: data.createdBy,
    createdAt: data.createdAt,
  };
}

function buildSettlementPayload(group: Group, values: SettlementFormValues) {
  const amountMinor = parseAmountToMinor(values.amount);
  const validation = validateSettlementInput({
    memberIds: group.memberIds,
    payerId: values.payerId,
    receiverId: values.receiverId,
    amountMinor,
  });

  if (!validation.ok) {
    throw new Error("Settlement validation failed.");
  }

  if (!values.date) {
    throw new Error("Settlement date is required.");
  }

  if (values.note.length > 500) {
    throw new Error("Keep the note under 500 characters.");
  }

  return {
    payerId: values.payerId,
    receiverId: values.receiverId,
    amountMinor,
    amountScale: 2,
    date: Timestamp.fromDate(new Date(`${values.date}T00:00:00`)),
    note: values.note.trim(),
  };
}

export function subscribeToSettlements(
  groupId: string,
  onSettlements: (settlements: Settlement[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const settlementsQuery = query(
    collection(firestore, "groups", groupId, "settlements"),
    orderBy("date", "desc"),
  );

  return onSnapshot(
    settlementsQuery,
    (snapshot) => onSettlements(snapshot.docs.map(toSettlement)),
    onError,
  );
}

export async function createSettlement(
  group: Group,
  userId: string,
  values: SettlementFormValues,
) {
  const settlementRef = await addDoc(
    collection(firestore, "groups", group.id, "settlements"),
    {
      ...buildSettlementPayload(group, values),
      createdBy: userId,
      createdAt: serverTimestamp(),
    },
  );

  return settlementRef.id;
}
