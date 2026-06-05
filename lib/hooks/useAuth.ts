"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth.service";
import type { ApiState, AuthUser } from "@/lib/types";

export function useAuth(): ApiState<AuthUser> {
  const [state, setState] = useState<ApiState<AuthUser>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setState({ data: user, loading: false, error: null });
    });
    return unsubscribe;
  }, []);

  return state;
}
