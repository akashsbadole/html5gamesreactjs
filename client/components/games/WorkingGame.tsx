import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

export default function WorkingGame({
  width = 400,
  height = 300,
  onScore,
}: GameProps) {
  const [score, setScore] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 150 });
  const [ballColor, setBallColor] = useState("#ff6b6b");
  const [isPlaying, setIsPlaying] = useState(true);

  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBallPosition((prev) => ({
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
      }));
      setBallColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 1000);

    return () => clearInterval(interval);
  }, [width, height, isPlaying]);

  const handleBallClick = () => {
    setScore((prev) => prev + 10);
    setClicks((prev) => prev + 1);
    onScore?.(score + 10);

    // Create click effect
    setBallColor("#ffd700");
    setTimeout(() => {
      setBallColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        Click the Moving Ball!
      </h3>

      {/* Game Area */}
      <div
        className="relative border-2 border-gray-600 rounded-lg bg-gray-800"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Moving Ball */}
        <div
          className="absolute w-10 h-10 rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: ballColor,
            left: `${ballPosition.x}px`,
            top: `${ballPosition.y}px`,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 20px ${ballColor}`,
          }}
          onClick={handleBallClick}
        />

        {/* Score Display */}
        <div className="absolute top-4 left-4 text-white font-bold">
          <div>Score: {score}</div>
          <div>Clicks: {clicks}</div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-gray-300 text-sm">
          Click the glowing ball to score points!
        </div>
      </div>

      {/* Game Controls */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? "Pause" : "Resume"}
        </button>
        <button
          onClick={() => {
            setScore(0);
            setClicks(0);
            setIsPlaying(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 text-center text-white">
        <p className="text-lg font-semibold">Score: {score}</p>
        <p className="text-sm text-gray-300">
          {clicks > 0
            ? `Accuracy: ${((clicks / (clicks + Math.max(0, clicks - 1))) * 100).toFixed(1)}%`
            : "Click to start!"}
        </p>
      </div>
    </div>
  );
}
