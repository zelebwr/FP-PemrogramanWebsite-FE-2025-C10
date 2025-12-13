// src/api/jeopardy/index.ts
import api from "@/api/axios";

// Base URL for this game type
const BASE_URL = "/api/game/game-type/jeopardy";

export const jeopardyApi = {
  // Create a new game (FormData required for file upload)
  create: async (formData: FormData) => {
    return await api.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Get game details (Metadata + JSON)
  // Used by Editor to load data and Lobby to show title
  getDetail: async (id: string) => {
    return await api.get(`${BASE_URL}/${id}`);
  },

  // The "Play" endpoint for the Operator
  // According to your brief, this returns the FULL data (questions + answers)
  play: async (id: string) => {
    // Using 'private' endpoint as Operator needs to see answers
    return await api.get(`${BASE_URL}/${id}/play`);
  },

  // Helper to increment play count on exit
  submitPlayCount: async (gameId: string) => {
    // Note: Adjust endpoint if backend uses a different path for generic counters
    return await api.post(`/api/game/play-count`, { game_id: gameId });
  },
};
