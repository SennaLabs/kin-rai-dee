// Authentication service — stub for Firebase Auth.
// Replace each method body once the Firebase SDK is installed (yarn add firebase).

import type { AuthUser } from "@/lib/types";

export const authService = {
  async signInAnonymously(): Promise<AuthUser> {
    // TODO: const { getAuth, signInAnonymously } = await import("firebase/auth");
    //       const { user } = await signInAnonymously(getAuth());
    //       return { id: user.uid, anonymous: true };
    return { id: `anon_${Date.now()}`, anonymous: true };
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: return getAuth().currentUser mapped to AuthUser, or null
    return null;
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    // TODO: return onAuthStateChanged(getAuth(), firebaseUser => callback(mapped))
    callback(null);
    return () => {};
  },
};
