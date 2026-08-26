import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/src/lib/firebase";
import type { UserProfile } from "@/src/types/user-profile";

function toUserProfile(snapshot: DocumentSnapshot<DocumentData>): UserProfile | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    displayName: data.displayName,
    shortName: data.shortName ?? null,
    email: data.email,
    photoURL: data.photoURL,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateUserProfileName(userId: string, shortName: string) {
  await updateDoc(doc(firestore, "users", userId), {
    shortName: shortName.trim(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUserProfile(
  userId: string,
  onProfile: (profile: UserProfile | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(firestore, "users", userId),
    (snapshot) => onProfile(toUserProfile(snapshot)),
    onError,
  );
}
