import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/src/lib/firebase";
import type { Group } from "@/src/types/group";
import type {
  AcceptInvitationResult,
  Invitation,
  InvitationStatus,
} from "@/src/types/invitation";

const invitationLifetimeMs = 24 * 60 * 60 * 1000;

function toInvitation(snapshot: DocumentSnapshot<DocumentData>): Invitation | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    groupId: data.groupId,
    createdBy: data.createdBy,
    status: data.status as InvitationStatus,
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    usedBy: data.usedBy,
    usedAt: data.usedAt,
  };
}

export function subscribeToInvitation(
  invitationId: string,
  onInvitation: (invitation: Invitation | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(firestore, "invitations", invitationId),
    (snapshot) => onInvitation(toInvitation(snapshot)),
    onError,
  );
}

export async function createInvitation(group: Group, userId: string) {
  if (group.memberIds.length >= 30) {
    throw new Error("This group is full.");
  }

  if (!group.memberIds.includes(userId)) {
    throw new Error("Only group members can create invitations.");
  }

  const invitationRef = await addDoc(collection(firestore, "invitations"), {
    groupId: group.id,
    createdBy: userId,
    status: "active",
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + invitationLifetimeMs),
    usedBy: null,
    usedAt: null,
  });

  return invitationRef.id;
}

export async function acceptInvitation(
  invitationId: string,
  userId: string,
): Promise<AcceptInvitationResult> {
  const invitationRef = doc(firestore, "invitations", invitationId);

  return runTransaction(firestore, async (transaction) => {
    const invitationSnapshot = await transaction.get(invitationRef);
    const invitation = toInvitation(invitationSnapshot);

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    if (invitation.status === "used") {
      throw new Error("This invitation has already been used.");
    }

    if (invitation.status === "revoked") {
      throw new Error("This invitation has been revoked.");
    }

    if (invitation.expiresAt.toMillis() <= Date.now()) {
      throw new Error("This invitation has expired.");
    }

    const groupRef = doc(firestore, "groups", invitation.groupId);

    try {
      const groupSnapshot = await getDoc(groupRef);

      if (groupSnapshot.exists()) {
        const group = groupSnapshot.data() as Group;

        if (group.memberIds.includes(userId)) {
          return { status: "already-member", groupId: invitation.groupId };
        }

        if (group.memberIds.length >= 30) {
          throw new Error("This group is full.");
        }
      }
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("permissions")) {
        throw error;
      }
    }

    transaction.update(groupRef, {
      memberIds: arrayUnion(userId),
      lastAcceptedInvitationId: invitationId,
      updatedAt: serverTimestamp(),
    });

    transaction.update(invitationRef, {
      status: "used",
      usedBy: userId,
      usedAt: serverTimestamp(),
    });

    return { status: "joined", groupId: invitation.groupId };
  });
}

export function isInvitationExpired(invitation: Invitation) {
  return invitation.expiresAt.toMillis() <= Date.now();
}
