// Room service — stub for Firebase Firestore.
// Replace each method body with Firestore calls once the SDK is installed.

import type { MatchResult, Player, Room, RoomFilters } from "@/lib/types";

export const roomService = {
  async create(hostId: string, filters: RoomFilters): Promise<Room> {
    // TODO: addDoc(collection(db, "rooms"), { hostId, filters, status: "waiting", ... })
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    return {
      id: `room_${Date.now()}`,
      code,
      hostId,
      players: [],
      filters,
      status: "waiting",
      createdAt: Date.now(),
    };
  },

  async join(
    code: string,
    player: Pick<Player, "name" | "emoji">,
  ): Promise<Room> {
    // TODO: query rooms where code == code, then arrayUnion the player document
    throw new Error(`Room "${code}" not found`);
  },

  async updatePlayerReady(
    roomId: string,
    playerId: string,
    ready: boolean,
  ): Promise<void> {
    // TODO: updateDoc(doc(db, "rooms", roomId), { `players.${playerId}.ready`: ready })
    void roomId;
    void playerId;
    void ready;
  },

  async submitVote(
    roomId: string,
    playerId: string,
    restaurantId: string,
    liked: boolean,
  ): Promise<MatchResult | null> {
    // TODO: record vote in Firestore; run a Cloud Function or transaction to detect
    // consensus and return MatchResult when all players have voted for the same place.
    void roomId;
    void playerId;
    void restaurantId;
    void liked;
    return null;
  },

  subscribeToRoom(roomId: string, callback: (room: Room) => void): () => void {
    // TODO: return onSnapshot(doc(db, "rooms", roomId), snap => callback(snap.data()))
    void roomId;
    void callback;
    return () => {};
  },
};
