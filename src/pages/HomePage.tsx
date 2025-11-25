import { useState, useEffect } from "react";
import api from "@/api/axios";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import Navbar from "@/components/ui/layout/Navbar";
import thumbnailPlaceholder from "../assets/images/thumbnail-placeholder.png";
import iconSearch from "../assets/images/icon-search.svg";
import iconHeart from "../assets/images/icon-heart.svg";
import iconPlay from "../assets/images/icon-play.svg";

type Game = {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_template: string;
  like_count: number;
  play_count: number;
  creator_name: string;
  is_liked: boolean;
};

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "most_liked">(
    "latest",
  );

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/game/");
        console.log("Fetched games data:", response.data);
        // Map the response data to ensure it matches our Game type if needed
        // Assuming the API returns the structure as described but we might need to handle missing fields
        setGames(
          response.data.data.map(
            (g: Partial<Game>) =>
              ({
                ...g,
                like_count: g.like_count || 0,
                play_count: g.play_count || 0,
                is_liked: g.is_liked || false,
                // Ensure mandatory fields are present or provide defaults if needed
                id: g.id || "",
                name: g.name || "Untitled",
                description: g.description || "",
                thumbnail_image: g.thumbnail_image || null,
                is_published: g.is_published || false,
                game_template: g.game_template || "quiz",
                creator_name: g.creator_name || "Unknown",
              }) as Game,
          ),
        );
      } catch (err) {
        setError("Failed to fetch games. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredAndSortedGames = games
    .filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.play_count - a.play_count;
      }
      if (sortBy === "most_liked") {
        return b.like_count - a.like_count;
      }
      return 0;
    });

  const handleLike = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    try {
      setGames((prev) =>
        prev.map((game) => {
          if (game.id === gameId) {
            return {
              ...game,
              is_liked: !game.is_liked,
              like_count: game.is_liked
                ? game.like_count - 1
                : game.like_count + 1,
            };
          }
          return game;
        }),
      );

      await api.post(`/api/game/game-type/quiz/${gameId}/like`);
    } catch (err) {
      console.error("Failed to like game:", err);

      setGames((prev) =>
        prev.map((game) => {
          if (game.id === gameId) {
            return {
              ...game,
              is_liked: !game.is_liked,
              like_count: game.is_liked
                ? game.like_count - 1
                : game.like_count + 1,
            };
          }
          return game;
        }),
      );
    }
  };

  const GameCard = ({ game }: { game: Game }) => {
    const handlePlayGame = () => {
      window.location.href = `/quiz/play/${game.id}`;
    };

    return (
      <Card
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handlePlayGame}
      >
        <div className="p-4 pb-0">
          <img
            src={
              game.thumbnail_image
                ? `${import.meta.env.VITE_API_URL}/${game.thumbnail_image}`
                : thumbnailPlaceholder
            }
            alt={game.thumbnail_image ? game.name : "Placeholder Thumbnail"}
            className="w-full aspect-video object-cover rounded-md"
          />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Typography
              variant="h4"
              className="text-base font-bold truncate pr-2"
            >
              {game.name}
            </Typography>
            <Badge variant="secondary" className="shrink-0">
              Quiz
            </Badge>
          </div>

          <Typography variant="muted" className="text-sm mb-4">
            {game.description}
          </Typography>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-900" />
              <span className="font-medium text-slate-900">
                {game.creator_name || "Unknown User"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors"
                onClick={(e) => handleLike(e, game.id)}
              >
                <img
                  src={iconHeart}
                  alt="Likes"
                  className={`w-3.5 h-3.5 ${game.is_liked ? "filter-red" : ""}`}
                  style={
                    game.is_liked
                      ? {
                          filter:
                            "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)",
                        }
                      : {}
                  }
                />
                <span className={game.is_liked ? "text-red-500" : ""}>
                  {game.like_count}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <img src={iconPlay} alt="Plays" className="w-3.5 h-3.5" />
                <span>{game.play_count} plays</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Typography variant="h3">Loading...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Typography variant="h3" className="text-destructive">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-8">
          <Typography variant="h2" className="mb-2 border-none">
            Discover Educational Games
          </Typography>
          <Typography variant="muted">
            Explore engaging games created by educators around the world
          </Typography>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <img
              src={iconSearch}
              alt=""
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search games..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === "latest" ? "default" : "outline"}
              className={
                sortBy === "latest"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-white"
              }
              onClick={() => setSortBy("latest")}
            >
              Latest
            </Button>

            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              className={
                sortBy === "popular"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-white"
              }
              onClick={() => setSortBy("popular")}
            >
              Popular
            </Button>

            <Button
              variant={sortBy === "most_liked" ? "default" : "outline"}
              size="icon"
              className={
                sortBy === "most_liked"
                  ? "bg-blue-500 hover:bg-blue-600 text-white w-10 px-0"
                  : "bg-white w-10 px-0"
              }
              onClick={() =>
                setSortBy(sortBy === "most_liked" ? "latest" : "most_liked")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGames.length > 0 ? (
            filteredAndSortedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Typography variant="muted">
                No games found. Try adjusting your search.
              </Typography>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
