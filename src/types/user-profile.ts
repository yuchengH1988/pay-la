import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  displayName: string | null;
  shortName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UserProfileMap = Record<string, UserProfile>;
