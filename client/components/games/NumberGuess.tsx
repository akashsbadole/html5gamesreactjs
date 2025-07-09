import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

export default function NumberGuess({ onScore }: GameProps) {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(10);
  const [feedback, setFeedback] = useState("");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  const ranges = {
    easy: { min: 1, max: 50, points: 50 },
    medium: { min: 1, max: 100, points: 100 },
    hard: { min: 1, max: 500, points: 200 },
  };

  // Start new game
  const startNewGame = (newDifficulty?: "easy" | "medium" | "hard") => {
    const diff = newDifficulty || difficulty;
    setDifficulty(diff);
    const range = ranges[diff];
    setTargetNumber(
      Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
    );
    setGuess("");
    setAttempts(0);
    setFeedback(`Guess a number between ${range.min} and ${range.max}!`);
    setGameState("playing");
  };

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const makeGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum)) {
      setFeedback("Please enter a valid number!");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      // Win!
      const points =
        ranges[difficulty].points -
        (newAttempts - 1) * 10 +
        (maxAttempts - newAttempts) * 5;
      const finalPoints = Math.max(points, 10);
      setScore((prev) => prev + finalPoints);
      onScore?.(score + finalPoints);
      setFeedback(
        `🎉 Correct! You won ${finalPoints} points in ${newAttempts} attempts!`,
      );
      setGameState("won");
    } else if (newAttempts >= maxAttempts) {
      // Lost
      setFeedback(`😞 Game over! The number was ${targetNumber}. Try again!`);
      setGameState("lost");
    } else {
      // Continue playing
      const difference = Math.abs(guessNum - targetNumber);
      let hint = "";

      if (difference <= 5) {
        hint = "🔥 Very close!";
      } else if (difference <= 15) {
        hint = "🟡 Close!";
      } else if (difference <= 30) {
        hint = "🔵 Getting warmer!";
      } else {
        hint = "❄️ Cold!";
      }

      setFeedback(
        `${guessNum > targetNumber ? "📉 Too high!" : "📈 Too low!"} ${hint} (${maxAttempts - newAttempts} attempts left)`,
      );
    }

    setGuess("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState === "playing") {
      makeGuess();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg text-white max-w-md mx-auto">
      <h3 className="text-3xl font-bold mb-2">🔢 Number Guessing Game</h3>

      {/* Difficulty Selection */}
      <div className="flex gap-2 mb-4">
        {Object.keys(ranges).map((diff) => (
          <button
            key={diff}
            onClick={() => startNewGame(diff as any)}
            className={`px-3 py-1 rounded text-sm ${
              difficulty === diff
                ? "bg-yellow-500 text-black"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
            <br />
            <span className="text-xs">
              1-{ranges[diff as keyof typeof ranges].max}
            </span>
          </button>
        ))}
      </div>

      {/* Game Stats */}
      <div className="flex gap-6 mb-6 text-lg">
        <div>Score: {score}</div>
        <div>
          Attempts: {attempts}/{maxAttempts}
        </div>
      </div>

      {/* Feedback */}
      <div className="text-center mb-6 min-h-[3rem] flex items-center">
        <p className="text-lg">{feedback}</p>
      </div>

      {/* Game Input */}
      {gameState === "playing" && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
            className="px-4 py-2 rounded-lg text-black text-center text-lg w-32"
            min={ranges[difficulty].min}
            max={ranges[difficulty].max}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors font-bold"
          >
            Guess!
          </button>
        </form>
      )}

      {/* Game Over Actions */}
      {gameState !== "playing" && (
        <button
          onClick={() => startNewGame()}
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-bold text-lg mb-4"
        >
          Play Again
        </button>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-300">
        <p className="mb-1">
          🎯 <strong>How to play:</strong>
        </p>
        <p className="mb-1">• Guess the secret number</p>
        <p className="mb-1">• Use the hot/cold clues</p>
        <p>• Score more points with fewer guesses!</p>
      </div>

      {/* Scoring Info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Base points: {ranges[difficulty].points}</p>
        <p>Bonus for speed and accuracy!</p>
      </div>
    </div>
  );
}
