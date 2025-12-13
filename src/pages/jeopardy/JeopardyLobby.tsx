// src/pages/jeopardy/JeopardyLobby.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JeopardyLobby() {
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

          {/* 2. Team Configuration Form Area (Ruang untuk Issue 2) */}
          <div className="space-y-4 border-t pt-4 border-gray-700">
            <h3 className="text-xl font-semibold text-gray-200">
              2. Team Configuration
            </h3>
            <div className="h-24 bg-gray-700/50 flex items-center justify-center rounded-lg border border-dashed border-gray-600">
              <p className="text-gray-500 italic">
                Team Configuration Form will be here (Issue 2)
              </p>
            </div>
          </div>

          {/* 3. Start Button */}
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-xl font-bold"
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
