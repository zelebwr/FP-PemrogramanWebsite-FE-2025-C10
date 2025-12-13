// src/pages/jeopardy/types.ts

export interface JeopardyClue {
  id: string;
  pointValue: number; // e.g., 200, 400, 600
  question: string;
  answer: string; // Visible only to the Operator
  isDailyDouble: boolean;
  isPlayed?: boolean; // UI state to track if clicked
}

export interface JeopardyCategory {
  id: string;
  title: string;
  clues: JeopardyClue[];
}

export interface JeopardyRound {
  id: string;
  name: string; // e.g., "Round 1", "Double Jeopardy"
  categories: JeopardyCategory[];
}

export interface JeopardySettings {
  maxTeams: number;
  timeLimitPerClue: number; // in seconds
  allowDailyDouble: boolean;
}

// The full structure stored in the database "game_json" column
export interface JeopardyGameData {
  settings: JeopardySettings;
  rounds: JeopardyRound[];
}

// The API Response structure
export interface GameDetail {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  game_json: JeopardyGameData;
}

export interface Team {
  id: number;
  name: string;
  score: number;
}
