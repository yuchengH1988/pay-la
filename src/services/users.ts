import {
  doc,
  onSnapshot,
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
    email: data.email,
    photoURL: data.photoURL,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
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
