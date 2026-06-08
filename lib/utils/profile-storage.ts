import { avatars } from "@/assets/avatars";

const KEY = "krd.profile";
const FALLBACK_AVATAR = String(avatars[0].id);

export type StoredProfile = { name: string; avatar: string };

export function loadProfile(): StoredProfile {
  if (typeof window === "undefined") return { name: "", avatar: FALLBACK_AVATAR };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { name: "", avatar: FALLBACK_AVATAR };
    const parsed = JSON.parse(raw) as Partial<StoredProfile>;
    const name = typeof parsed.name === "string" ? parsed.name : "";
    const valid =
      typeof parsed.avatar === "string" &&
      avatars.some((a) => String(a.id) === parsed.avatar);
    return { name, avatar: valid ? (parsed.avatar as string) : FALLBACK_AVATAR };
  } catch {
    return { name: "", avatar: FALLBACK_AVATAR };
  }
}

export function saveProfile(profile: StoredProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Safari private mode throws on setItem — prefill is best-effort, ignore.
  }
}
