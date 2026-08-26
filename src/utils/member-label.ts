import type { UserProfileMap } from "@/src/types/user-profile";

export function formatMemberLabel(
  memberId: string,
  _currentUserId: string,
  profiles: UserProfileMap = {},
) {
  const profile = profiles[memberId];

  return (
    profile?.shortName ||
    profile?.displayName ||
    profile?.email ||
    `${memberId.slice(0, 8)}...${memberId.slice(-4)}`
  );
}
