// src/pages/jeopardy/JeopardyBoard.tsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jeopardyApi } from "@/api/jeopardy";
import {
  type JeopardyGameData,
  type JeopardyClue,
  type Team,
} from "./types/jeopardy-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react"; // Icon for exit button

export default function JeopardyBoard() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. STATE INITIALIZATION
  const [gameData, setGameData] = useState<JeopardyGameData | null>(null);
  // We initialize teams from the router state (passed from Lobby)
  const [teams, setTeams] = useState<Team[]>(location.state?.teams || []);
  const [playedClues, setPlayedClues] = useState<string[]>([]);
  const [currentClue, setCurrentClue] = useState<JeopardyClue | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // 2. REDIRECT LOGIC (The Fix)
  useEffect(() => {
    // If we have no ID, or no teams were passed in state, go to Setup
    if (!id) return;
    if (!location.state?.teams || location.state.teams.length === 0) {
      // 'replace: true' prevents the user from clicking 'Back' and getting stuck in a loop
      navigate(`/jeopardy/play/${id}/setup`, { replace: true });
    }
  }, [id, location.state, navigate]);

  // 3. DATA FETCHING
  useEffect(() => {
    if (!id) return;
    jeopardyApi
      .play(id)
      .then((res) => {
        setGameData(res.data.data.game_json);
      })
      .catch((err) => {
        console.error("Failed to load game", err);
      });
  }, [id]);

  // 4. GAMEPLAY LOGIC
  const updateScore = (teamId: number, delta: number) => {
    setTeams(
      teams.map((t) =>
        t.id === teamId ? { ...t, score: t.score + delta } : t,
      ),
    );
  };

  const handleClueClick = (clue: JeopardyClue) => {
    if (playedClues.includes(clue.id)) return;
    setCurrentClue(clue);
    setIsAnswerRevealed(false);
  };

  const handleCloseModal = () => {
    if (currentClue) {
      setPlayedClues([...playedClues, currentClue.id]);
      setCurrentClue(null);
    }
  };

  // 5. EXIT LOGIC (Required by Ketentuan Point 49 & 50)
  const handleExit = async () => {
    try {
      if (id) {
        //  "lakukan post req ke backend untuk menambah play count"
        await jeopardyApi.submitPlayCount(id);
      }
    } catch (error) {
      console.error("Failed to submit play count", error);
    } finally {
      //  "exit button yang mengarah ke home page"
      navigate("/");
    }
  };

  // Prevent rendering if redirecting or loading
  if (!gameData || teams.length === 0) return null;

  const activeRound = gameData.rounds[0];

  return (
    <div className="min-h-screen bg-blue-950 text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="p-4 bg-blue-900 flex justify-between items-center shadow-md border-b-4 border-black">
        <h1 className="text-xl font-bold tracking-wider uppercase text-yellow-400">
          {gameData.rounds[0].name}
        </h1>

        {/* EXIT BUTTON  */}
        <Button
          variant="destructive"
          onClick={handleExit}
          className="font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> EXIT
        </Button>
      </header>

      {/* MAIN GRID */}
      <main className="flex-1 p-4 overflow-auto flex justify-center items-center">
        <div
          className="grid gap-2 w-full max-w-6xl"
          style={{
            gridTemplateColumns: `repeat(${activeRound.categories.length}, 1fr)`,
          }}
        >
          {/* CATEGORY HEADERS */}
          {activeRound.categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-blue-800 p-2 md:p-4 flex items-center justify-center text-center font-bold uppercase shadow-inner min-h-[5rem] md:min-h-[6rem] border-2 border-black text-xs md:text-sm lg:text-base tracking-wide drop-shadow-md"
            >
              {cat.title}
            </div>
          ))}

          {/* CLUE CELLS */}
          {Array.from({ length: 5 }).map((_, rowIndex) =>
            activeRound.categories.map((cat) => {
              const clue = cat.clues[rowIndex];
              const isPlayed = playedClues.includes(clue?.id);

              return (
                <div
                  key={clue?.id || `empty-${cat.id}-${rowIndex}`}
                  onClick={() => clue && !isPlayed && handleClueClick(clue)}
                  className={cn(
                    "h-16 md:h-24 flex items-center justify-center text-xl md:text-4xl font-bold text-yellow-400 border-2 border-black transition-all duration-150",
                    isPlayed
                      ? "bg-blue-900/40 text-transparent cursor-default"
                      : "bg-blue-700 hover:bg-blue-600 cursor-pointer hover:scale-[1.02]",
                    !clue && "invisible",
                  )}
                >
                  {isPlayed ? "" : `$${clue?.pointValue}`}
                </div>
              );
            }),
          )}
        </div>
      </main>

      {/* SCOREBOARD FOOTER */}
      <footer className="bg-black p-4 border-t-4 border-yellow-500">
        <div className="flex justify-center flex-wrap gap-4 md:gap-8">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-blue-900 border-2 border-yellow-500 min-w-[120px] p-3 rounded-lg text-center shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1 text-yellow-200">
                {team.name}
              </div>
              <div
                className={cn(
                  "text-2xl md:text-3xl font-mono font-bold",
                  team.score < 0 ? "text-red-400" : "text-white",
                )}
              >
                ${team.score}
              </div>
            </div>
          ))}
        </div>
      </footer>

      {/* QUESTION MODAL */}
      <Dialog
        open={!!currentClue}
        onOpenChange={(open) => !open && handleCloseModal()}
      >
        <DialogContent className="bg-blue-800 text-white border-4 border-black max-w-5xl w-[90vw] h-[80vh] flex flex-col p-0 overflow-hidden [&>button]:text-white">
          <DialogHeader className="p-4 bg-blue-900 border-b-2 border-black">
            <DialogTitle className="text-center text-yellow-400 text-3xl font-bold uppercase tracking-widest">
              ${currentClue?.pointValue}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 overflow-y-auto">
            <p className="text-3xl md:text-5xl font-serif font-bold uppercase leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              {currentClue?.question}
            </p>

            {isAnswerRevealed && (
              <div className="mt-10 p-6 bg-green-900/90 rounded-xl border-4 border-green-500 animate-in fade-in zoom-in duration-300">
                <span className="block text-sm uppercase text-green-300 mb-2 font-bold tracking-widest">
                  Correct Response
                </span>
                <p className="text-2xl md:text-4xl font-bold text-white">
                  {currentClue?.answer}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-900 border-t-2 border-black">
            {!isAnswerRevealed ? (
              <Button
                onClick={() => setIsAnswerRevealed(true)}
                className="w-full py-8 text-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest"
              >
                Reveal Answer
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-center gap-4 overflow-x-auto pb-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-blue-950 p-3 rounded-lg border border-blue-700 flex flex-col items-center min-w-[100px]"
                    >
                      <span className="font-bold truncate w-full text-center text-sm mb-2 text-yellow-100">
                        {team.name}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          className="h-10 w-10 bg-green-600 hover:bg-green-500 rounded-full"
                          onClick={() =>
                            updateScore(team.id, currentClue!.pointValue)
                          }
                        >
                          ✓
                        </Button>
                        <Button
                          size="icon"
                          className="h-10 w-10 bg-red-600 hover:bg-red-500 rounded-full"
                          onClick={() =>
                            updateScore(team.id, -currentClue!.pointValue)
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleCloseModal}
                  variant="secondary"
                  className="w-full font-bold uppercase tracking-wider"
                >
                  Back to Board
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
