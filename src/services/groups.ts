import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/src/lib/firebase";
import type { Group, GroupFormValues } from "@/src/types/group";

function toGroup(snapshot: QueryDocumentSnapshot<DocumentData>): Group {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name,
    currency: data.currency,
    memberIds: data.memberIds,
    createdBy: data.createdBy,
    lastAcceptedInvitationId: data.lastAcceptedInvitationId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function subscribeToUserGroups(
  userId: string,
  onGroups: (groups: Group[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const groupsQuery = query(
    collection(firestore, "groups"),
    where("memberIds", "array-contains", userId),
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      const groups = snapshot.docs
        .map(toGroup)
        .sort((groupA, groupB) => {
          const groupATime = groupA.updatedAt?.toMillis() ?? 0;
          const groupBTime = groupB.updatedAt?.toMillis() ?? 0;

          return groupBTime - groupATime;
        });

      onGroups(groups);
    },
    onError,
  );
}

export function subscribeToGroup(
  groupId: string,
  onGroup: (group: Group | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(firestore, "groups", groupId),
    (snapshot) => {
      onGroup(snapshot.exists() ? toGroup(snapshot) : null);
    },
    onError,
  );
}

export async function createGroup(userId: string, values: GroupFormValues) {
  const groupRef = await addDoc(collection(firestore, "groups"), {
    name: values.name.trim(),
    currency: values.currency,
    memberIds: [userId],
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return groupRef.id;
}

export async function updateGroup(groupId: string, values: GroupFormValues) {
  await updateDoc(doc(firestore, "groups", groupId), {
    name: values.name.trim(),
    currency: values.currency,
    updatedAt: serverTimestamp(),
  });
}
