// src/pages/jeopardy/JeopardyLobby.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react"; // <-- PENTING: Import useState

// Definisikan tipe data Team
interface Team {
  id: number;
  name: string;
  score: number;
}

export default function JeopardyLobby() {
  // State untuk mengelola daftar tim. Dimulai dengan 2 tim.
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: "Team A", score: 0 },
    { id: 2, name: "Team B", score: 0 },
  ]);

  // Fungsi untuk menambah tim baru
  const addTeam = () => {
    const newId =
      teams.length > 0 ? Math.max(...teams.map((t) => t.id)) + 1 : 1;
    // Tentukan nama default berdasarkan jumlah tim
    const defaultName = `Team ${String.fromCharCode(65 + teams.length)}`;
    setTeams([...teams, { id: newId, name: defaultName, score: 0 }]);
  };

  // Fungsi untuk menghapus tim
  const removeTeam = (id: number) => {
    // Batasan: Hanya izinkan penghapusan jika tim lebih dari 2
    if (teams.length > 2) {
      setTeams(teams.filter((team) => team.id !== id));
    }
  };

  // Fungsi untuk memperbarui nama tim
  const handleNameChange = (id: number, newName: string) => {
    setTeams(
      teams.map((team) => (team.id === id ? { ...team, name: newName } : team)),
    );
  };

  // Cek apakah game siap dimulai (minimal 2 tim dan semua nama terisi)
  const isGameReady =
    teams.length >= 2 && teams.every((t) => t.name.trim() !== "");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-12 text-yellow-400 drop-shadow-lg">
        Jeopardy Game Setup
      </h1>

      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-3xl text-yellow-400">
            Lobby Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* 1. Project Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-200">
              1. Select Project
            </h3>
            <div className="flex space-x-4">
              <div className="flex-grow">
                <Label htmlFor="project-id" className="text-gray-400">
                  Project ID (Placeholder)
                </Label>
                <Input
                  id="project-id"
                  defaultValue="1"
                  placeholder="Enter Project ID"
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled
                />
              </div>
              <div className="flex-grow-0 self-end">
                <Button variant="secondary" disabled>
                  Load Project
                </Button>
              </div>
            </div>
          </div>

          {/* 2. Team Configuration Form Area (Issue 2 Implementation) */}
          <div className="space-y-4 border-t pt-4 border-gray-700">
            <h3 className="text-xl font-semibold text-gray-200">
              2. Team Configuration ({teams.length} Teams)
            </h3>
            <div className="space-y-3">
              {teams.map((team, index) => (
                <div key={team.id} className="flex space-x-3 items-center">
                  <Label className="w-10 text-lg text-yellow-300">
                    #{index + 1}
                  </Label>
                  <Input
                    type="text"
                    value={team.name}
                    onChange={(e) => handleNameChange(team.id, e.target.value)}
                    placeholder={`Enter Name for Team ${index + 1}`}
                    className="flex-grow bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => removeTeam(team.id)}
                    disabled={teams.length <= 2} // Tidak bisa menghapus jika tim <= 2
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={addTeam}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            >
              + Add New Team
            </Button>

            {teams.length < 2 && (
              <p className="text-red-400 text-sm mt-2">
                Minimum 2 teams are required to start the game.
              </p>
            )}
          </div>

          {/* 3. Start Button */}
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-xl font-bold"
              disabled={!isGameReady} // Tombol Start hanya aktif jika isGameReady TRUE
              onClick={() => {
                // TODO: Implementasi navigasi ke game board di Issue 4
                console.log("Starting game with teams:", teams);
                alert("Game Start Log: Teams prepared (Issue 2 Done)");
              }}
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
