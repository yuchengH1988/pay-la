"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "@/src/lib/firebase";
import { syncUserProfile } from "@/src/services/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!isActive) {
        return;
      }

      setAuthState({ user, loading: false, error: null });

      if (!user) {
        return;
      }

      try {
        await syncUserProfile(user);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAuthState({
          user,
          loading: false,
          error: getAuthErrorMessage(error),
        });
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return authState;
}
