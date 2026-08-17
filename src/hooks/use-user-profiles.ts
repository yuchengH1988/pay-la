"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToUserProfile } from "@/src/services/users";
import type { UserProfileMap } from "@/src/types/user-profile";

type UserProfilesState = {
  key: string;
  profiles: UserProfileMap;
  error: string | null;
};

function getErrorMessage(error: Error) {
  return error.message || "Unable to load user profiles.";
}

export function useUserProfiles(userIds: string[]) {
  const stableUserIds = useMemo(() => [...new Set(userIds)].sort(), [userIds]);
  const key = stableUserIds.join("|");
  const [state, setState] = useState<UserProfilesState>({
    key,
    profiles: {},
    error: null,
  });

  useEffect(() => {
    if (stableUserIds.length === 0) {
      return;
    }

    const unsubscribes = stableUserIds.map((userId) =>
      subscribeToUserProfile(
        userId,
        (profile) => {
          setState((current) => {
            const profiles = { ...current.profiles };

            if (profile) {
              profiles[userId] = profile;
            } else {
              delete profiles[userId];
            }

            return { key, profiles, error: null };
          });
        },
        (error) =>
          setState((current) => ({
            key,
            profiles: current.profiles,
            error: getErrorMessage(error),
          })),
      ),
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [key, stableUserIds]);

  if (stableUserIds.length === 0) {
    return { profiles: {}, error: null };
  }

  if (state.key !== key) {
    return { profiles: {}, error: null };
  }

  return {
    profiles: state.profiles,
    error: state.error,
  };
}
