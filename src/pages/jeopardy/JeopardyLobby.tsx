// src/pages/jeopardy/JeopardyLobby.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { jeopardyApi } from "@/api/jeopardy/index";
import { type Team } from "./types/jeopardy-types";

export default function JeopardyLobby() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gameTitle, setGameTitle] = useState("Loading...");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: "Team 1", score: 0 },
    { id: 2, name: "Team 2", score: 0 },
  ]);

  // Fetch basic game info for the header
  useEffect(() => {
    if (id) {
      jeopardyApi.getDetail(id).then((res) => {
        setGameTitle(res.data.data.name);
      });
    }
  }, [id]);

  // Dynamic input generation logic
  const handleTeamCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(6, count)); // Clamp between 1 and 6
    setTeamCount(newCount);

    // Preserve existing names if reducing, add new ones if increasing
    setTeams((prev) => {
      const newTeams = [...prev];
      if (newCount > prev.length) {
        for (let i = prev.length + 1; i <= newCount; i++) {
          newTeams.push({ id: i, name: `Team ${i}`, score: 0 });
        }
      } else {
        newTeams.splice(newCount);
      }
      return newTeams;
    });
  };

  const handleNameChange = (id: number, name: string) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const handleStartGame = () => {
    // Pass the configured teams to the board via Router State
    navigate(`/jeopardy/play/${id}`, { state: { teams } });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-2 text-yellow-400">
        JEOPARDY! LOBBY
      </h1>
      <p className="text-xl mb-8">Game: {gameTitle}</p>

      <Card className="w-full max-w-md p-6 bg-slate-900 border-slate-700">
        <div className="mb-6">
          <label className="block mb-2 font-semibold">
            Number of Teams: {teamCount}
          </label>
          <input
            type="range"
            min="1"
            max="6"
            value={teamCount}
            onChange={(e) => handleTeamCountChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-4 mb-8">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                {team.id}
              </span>
              <Input
                value={team.name}
                onChange={(e) => handleNameChange(team.id, e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder={`Team ${team.id} Name`}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleStartGame}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-6 text-xl"
        >
          START GAME
        </Button>
      </Card>
    </div>
  );
}
