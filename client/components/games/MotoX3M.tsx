import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

export default function MotoX3M({ onScore }: GameProps) {
  const [bikePosition, setBikePosition] = useState(50);
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [obstacles, setObstacles] = useState<
    Array<{ x: number; type: "ramp" | "pool" | "hurdle"; passed: boolean }>
  >([]);
  const [gameState, setGameState] = useState<"playing" | "crashed">("playing");
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    // Initialize obstacles
    const newObstacles = [];
    for (let i = 1; i <= 10; i++) {
      newObstacles.push({
        x: i * 150,
        type: ["ramp", "pool", "hurdle"][Math.floor(Math.random() * 3)] as
          | "ramp"
          | "pool"
          | "hurdle",
        passed: false,
      });
    }
    setObstacles(newObstacles);
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = setInterval(() => {
      setDistance((prev) => prev + speed);

      // Check obstacles
      setObstacles((prev) =>
        prev.map((obstacle) => {
          if (
            !obstacle.passed &&
            distance >= obstacle.x - 50 &&
            distance <= obstacle.x + 50
          ) {
            if (obstacle.type === "hurdle" && !isJumping) {
              setGameState("crashed");
            } else if (!obstacle.passed) {
              setScore((s) => {
                const newScore = s + 20;
                onScore?.(newScore);
                return newScore;
              });
              return { ...obstacle, passed: true };
            }
          }
          return obstacle;
        }),
      );
    }, 100);

    return () => clearInterval(gameLoop);
  }, [speed, distance, isJumping, gameState, onScore]);

  const accelerate = () => {
    setSpeed((prev) => Math.min(prev + 1, 10));
  };

  const brake = () => {
    setSpeed((prev) => Math.max(prev - 1, 0));
  };

  const jump = () => {
    if (isJumping) return;
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 1000);
  };

  const restart = () => {
    setBikePosition(50);
    setSpeed(0);
    setScore(0);
    setDistance(0);
    setGameState("playing");
    setIsJumping(false);
    setObstacles((prev) => prev.map((o) => ({ ...o, passed: false })));
  };

  const getObstacleIcon = (type: string) => {
    switch (type) {
      case "ramp":
        return "⛰️";
      case "pool":
        return "🏊";
      case "hurdle":
        return "🚧";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-blue-200 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Moto X3M Pool Party
      </h3>

      {/* Game Track */}
      <div
        className="relative border-2 border-gray-600 rounded-lg bg-gradient-to-r from-yellow-300 to-orange-300 overflow-hidden"
        style={{ width: "600px", height: "200px" }}
      >
        {/* Track */}
        <div className="absolute bottom-0 w-full h-16 bg-gray-600">
          <div className="h-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center">
            {/* Track lines */}
            <div className="w-full h-1 bg-yellow-400 relative">
              <div className="absolute top-0 left-0 w-full h-full bg-yellow-400 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Bike */}
        <div
          className={`absolute transition-all duration-300 ${
            isJumping ? "animate-bounce" : ""
          }`}
          style={{
            left: "50px",
            bottom: isJumping ? "100px" : "64px",
            fontSize: "24px",
          }}
        >
          🏍️
        </div>

        {/* Obstacles */}
        {obstacles.map((obstacle, index) => {
          const screenX = obstacle.x - distance + 100;
          if (screenX > -50 && screenX < 650) {
            return (
              <div
                key={index}
                className="absolute bottom-16 text-2xl"
                style={{ left: `${screenX}px` }}
              >
                {getObstacleIcon(obstacle.type)}
                {obstacle.passed && (
                  <div className="text-green-500 text-sm">✓</div>
                )}
              </div>
            );
          }
          return null;
        })}

        {/* Speed indicator */}
        <div className="absolute top-4 left-4 text-white font-bold">
          <div>Speed: {speed * 10} mph</div>
          <div>Distance: {distance}m</div>
        </div>

        {/* Finish line */}
        {distance > 1400 && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center">
            <div className="text-4xl font-bold text-white">🏁 FINISH! 🏁</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-3 gap-4 w-full max-w-md">
        <button
          onClick={brake}
          className="bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 font-bold"
        >
          🛑 BRAKE
        </button>
        <button
          onClick={jump}
          disabled={isJumping}
          className="bg-yellow-500 text-white py-3 px-4 rounded hover:bg-yellow-600 font-bold disabled:bg-gray-400"
        >
          🚀 JUMP
        </button>
        <button
          onClick={accelerate}
          className="bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600 font-bold"
        >
          ⚡ SPEED
        </button>
      </div>

      {/* Game State */}
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold">Score: {score}</p>
        {gameState === "crashed" && (
          <div className="mt-2">
            <p className="text-red-500 font-bold text-xl">💥 CRASHED! 💥</p>
            <button
              onClick={restart}
              className="mt-2 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
            >
              Restart Race
            </button>
          </div>
        )}
        {distance > 1400 && gameState === "playing" && (
          <div className="mt-2">
            <p className="text-green-500 font-bold text-xl">🏆 WINNER! 🏆</p>
            <button
              onClick={restart}
              className="mt-2 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
            >
              Race Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600 text-center">
        <p>Use BRAKE, JUMP, and SPEED buttons to navigate obstacles!</p>
        <p>Jump over hurdles 🚧, speed through ramps ⛰️ and pools 🏊</p>
      </div>
    </div>
  );
}
