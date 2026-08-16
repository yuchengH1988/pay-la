import type { Timestamp } from "firebase/firestore";

export type InvitationStatus = "active" | "used" | "revoked";

export type Invitation = {
  id: string;
  groupId: string;
  createdBy: string;
  status: InvitationStatus;
  createdAt?: Timestamp;
  expiresAt: Timestamp;
  usedBy: string | null;
  usedAt?: Timestamp | null;
};

export type AcceptInvitationResult =
  | { status: "joined"; groupId: string }
  | { status: "already-member"; groupId: string };
