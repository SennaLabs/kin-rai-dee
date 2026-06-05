import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import type { AuthUser } from "@/lib/types";

function mapUser(u: User): AuthUser {
  return {
    id: u.uid,
    anonymous: u.isAnonymous,
    displayName: u.displayName ?? undefined,
    photoURL: u.photoURL ?? undefined,
  };
}

export const authService = {
  async signInAnonymously(): Promise<AuthUser> {
    const { user } = await signInAnonymously(firebaseAuth());
    return mapUser(user);
  },

  getCurrentUser(): AuthUser | null {
    const user = firebaseAuth().currentUser;
    return user ? mapUser(user) : null;
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(firebaseAuth(), (user) => {
      callback(user ? mapUser(user) : null);
    });
  },
};
