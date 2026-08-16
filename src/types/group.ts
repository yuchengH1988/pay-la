import type { Timestamp } from "firebase/firestore";

export type Group = {
  id: string;
  name: string;
  currency: string;
  memberIds: string[];
  createdBy: string;
  lastAcceptedInvitationId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type GroupFormValues = {
  name: string;
  currency: string;
};
