// src/pages/jeopardy/CreateJeopardy.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { jeopardyApi } from "@/api/jeopardy";
import axios from "axios";
import {
  type JeopardyGameData,
  type JeopardyClue,
} from "./types/jeopardy-types";

// Helper to create empty state
const createInitialState = (): JeopardyGameData => ({
  settings: { maxTeams: 4, timeLimitPerClue: 30, allowDailyDouble: true },
  rounds: [
    {
      id: "round-1",
      name: "Round 1",
      categories: Array.from({ length: 5 }, (_, cIdx) => ({
        id: `cat-${cIdx}`,
        title: `Category ${cIdx + 1}`,
        clues: Array.from({ length: 5 }, (_, rIdx) => ({
          id: `clue-${cIdx}-${rIdx}`,
          pointValue: (rIdx + 1) * 200,
          question: "",
          answer: "",
          isDailyDouble: false,
        })),
      })),
    },
  ],
});

export default function CreateJeopardy() {
  const navigate = useNavigate();

  // Metadata State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Game Data State
  const [gameData, setGameData] =
    useState<JeopardyGameData>(createInitialState());

  // Editing State
  const [editingClue, setEditingClue] = useState<{
    catIdx: number;
    clueIdx: number;
  } | null>(null);
  const [tempClueData, setTempClueData] = useState<JeopardyClue | null>(null);

  // Handlers
  const handleCategoryChange = (catIdx: number, newTitle: string) => {
    const newRounds = [...gameData.rounds];
    newRounds[0].categories[catIdx].title = newTitle;
    setGameData({ ...gameData, rounds: newRounds });
  };

  const openEditClue = (catIdx: number, clueIdx: number) => {
    setEditingClue({ catIdx, clueIdx });
    setTempClueData(gameData.rounds[0].categories[catIdx].clues[clueIdx]);
  };

  const saveClue = () => {
    if (!editingClue || !tempClueData) return;
    const newRounds = [...gameData.rounds];
    newRounds[0].categories[editingClue.catIdx].clues[editingClue.clueIdx] =
      tempClueData;
    setGameData({ ...gameData, rounds: newRounds });
    setEditingClue(null);
  };

  const handlePublish = async (isPublished: boolean) => {
    try {
      // 1. VALIDATION: Check for empty fields
      // The backend will reject empty strings, so we must validate first.
      const isGridComplete = gameData.rounds.every((r) =>
        r.categories.every((c) =>
          c.clues.every(
            (clue) => clue.question.trim() !== "" && clue.answer.trim() !== "",
          ),
        ),
      );

      if (!isGridComplete) {
        alert("Please fill in ALL questions and answers before publishing.");
        return;
      }

      if (!thumbnail) {
        alert("Please upload a thumbnail image.");
        return;
      }

      const formData = new FormData();
      formData.append("name", title);
      formData.append("description", description);
      if (thumbnail) formData.append("thumbnail_image", thumbnail);

      // Backend expects "true" or "false" as string, or boolean.
      // Safest to send string "true"/"false" if using FormData.
      formData.append("is_publish_immediately", String(isPublished));

      // 2. MAPPING: Convert Frontend (camelCase) to Backend (snake_case)
      const backendSettings = {
        max_teams: gameData.settings.maxTeams,
        time_limit_per_clue: gameData.settings.timeLimitPerClue,
        allow_daily_double: gameData.settings.allowDailyDouble,
        // Add required defaults that might not be in your UI yet
        double_jeopardy_multiplier: 2,
        starting_score: 0,
      };

      const backendRounds = gameData.rounds.map((round) => ({
        type: "jeopardy", // REQUIRED: The backend needs to know the round type
        name: round.name,
        categories: round.categories.map((cat) => ({
          title: cat.title,
          clues: cat.clues.map((clue) => ({
            question: clue.question,
            answer: clue.answer,
            value: clue.pointValue, // MAP: pointValue -> value
            is_daily_double: clue.isDailyDouble, // MAP: isDailyDouble -> snake_case
          })),
        })),
      }));

      // 3. SERIALIZATION: Append as JSON strings
      formData.append("settings", JSON.stringify(backendSettings));
      formData.append("rounds", JSON.stringify(backendRounds));

      // 4. SEND
      await jeopardyApi.create(formData);
      navigate("/my-projects");
    } catch (error: unknown) {
      console.error("Failed to save", error);
      // Derive a user-friendly message from different error shapes
      let message = "Failed to save game";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }

      alert(`Error: ${JSON.stringify(message)}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Jeopardy Game</h1>

      {/* Metadata Section */}
      <div className="grid gap-4 mb-8 p-6 border rounded-lg bg-gray-50">
        <Input
          placeholder="Game Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="file"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />
      </div>

      {/* Grid Editor */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-5 gap-4">
          {/* Headers */}
          {gameData.rounds[0].categories.map((cat, idx) => (
            <Input
              key={cat.id}
              value={cat.title}
              onChange={(e) => handleCategoryChange(idx, e.target.value)}
              className="font-bold text-center bg-blue-100"
            />
          ))}

          {/* Cells */}
          {Array.from({ length: 5 }).map((_, rowIdx) =>
            gameData.rounds[0].categories.map((cat, colIdx) => {
              const clue = cat.clues[rowIdx];
              const isFilled =
                clue.question.length > 0 && clue.answer.length > 0;

              return (
                <div
                  key={clue.id}
                  onClick={() => openEditClue(colIdx, rowIdx)}
                  className={`h-24 border rounded flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isFilled
                      ? "bg-green-100 border-green-500"
                      : "bg-white border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-bold">${clue.pointValue}</span>
                  <span className="text-xs text-gray-500">
                    {isFilled ? "Edited" : "Empty"}
                  </span>
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-end">
        <Button variant="outline" onClick={() => handlePublish(false)}>
          Save Draft
        </Button>
        <Button onClick={() => handlePublish(true)}>Publish Game</Button>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingClue}
        onOpenChange={(open) => !open && setEditingClue(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clue (${tempClueData?.pointValue})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">
                Question (The prompt shown to players)
              </label>
              <Textarea
                value={tempClueData?.question || ""}
                onChange={(e) =>
                  setTempClueData((curr) =>
                    curr
                      ? {
                          ...curr,
                          question: e.target.value,
                        }
                      : null,
                  )
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Answer (Visible to Operator)
              </label>
              <Textarea
                value={tempClueData?.answer || ""}
                onChange={(e) =>
                  setTempClueData((curr) =>
                    curr
                      ? {
                          ...curr,
                          answer: e.target.value,
                        }
                      : null,
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveClue}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
