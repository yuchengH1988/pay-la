import type { UserProfileMap } from "@/src/types/user-profile";

export function formatMemberLabel(
  memberId: string,
  currentUserId: string,
  profiles: UserProfileMap = {},
) {
  if (memberId === currentUserId) {
    return "You";
  }

  const profile = profiles[memberId];

  return (
    profile?.displayName ||
    profile?.email ||
    `${memberId.slice(0, 8)}...${memberId.slice(-4)}`
  );
}
