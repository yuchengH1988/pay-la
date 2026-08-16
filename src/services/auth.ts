import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseAuth, firestore } from "@/src/lib/firebase";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithPopup(firebaseAuth, googleProvider);
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export async function syncUserProfile(user: User) {
  const userRef = doc(firestore, "users", user.uid);
  const profile = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
  };
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    await updateDoc(userRef, profile);
    return;
  }

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
  });
}
