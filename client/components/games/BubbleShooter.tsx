import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: string;
  row: number;
  col: number;
}

const COLORS = ["🔴", "🟡", "🟢", "🔵", "🟣", "🟠"];

export default function BubbleShooter({ onScore }: GameProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [currentColor, setCurrentColor] = useState("🔴");
  const [nextColor, setNextColor] = useState("🟡");
  const [score, setScore] = useState(0);
  const [shooterAngle, setShooterAngle] = useState(0);

  useEffect(() => {
    initializeBubbles();
  }, []);

  const initializeBubbles = () => {
    const newBubbles: Bubble[] = [];
    let id = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        if (Math.random() > 0.3) {
          newBubbles.push({
            id: id++,
            x: col * 40 + (row % 2) * 20,
            y: row * 35,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            row,
            col,
          });
        }
      }
    }
    setBubbles(newBubbles);
  };

  const shootBubble = (targetX: number, targetY: number) => {
    // Find nearest position to attach bubble
    const bubbleSize = 40;
    const gridCol = Math.round(targetX / bubbleSize);
    const gridRow = Math.round(targetY / 35);

    // Check if position is valid and adjacent to existing bubbles
    const hasAdjacentBubble = bubbles.some(
      (bubble) =>
        Math.abs(bubble.row - gridRow) <= 1 &&
        Math.abs(bubble.col - gridCol) <= 1,
    );

    if (hasAdjacentBubble || gridRow === 0) {
      // Place the bubble
      const newBubble: Bubble = {
        id: Date.now(),
        x: gridCol * 40 + (gridRow % 2) * 20,
        y: gridRow * 35,
        color: currentColor,
        row: gridRow,
        col: gridCol,
      };

      setBubbles((prev) => [...prev, newBubble]);

      // Check for matches
      setTimeout(() => {
        checkMatches(newBubble);
      }, 100);

      // Get new colors
      setCurrentColor(nextColor);
      setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  };

  const checkMatches = (newBubble: Bubble) => {
    const connectedBubbles = findConnectedBubbles(newBubble);

    if (connectedBubbles.length >= 3) {
      // Remove matched bubbles
      setBubbles((prev) =>
        prev.filter((bubble) => !connectedBubbles.includes(bubble)),
      );

      setScore((prev) => {
        const newScore = prev + connectedBubbles.length * 10;
        onScore?.(newScore);
        return newScore;
      });
    }
  };

  const findConnectedBubbles = (startBubble: Bubble): Bubble[] => {
    const visited = new Set<number>();
    const toCheck = [startBubble];
    const connected: Bubble[] = [];

    while (toCheck.length > 0) {
      const current = toCheck.pop()!;
      if (visited.has(current.id)) continue;

      visited.add(current.id);
      if (current.color === startBubble.color) {
        connected.push(current);

        // Check neighbors
        const neighbors = bubbles.filter(
          (bubble) =>
            !visited.has(bubble.id) &&
            Math.abs(bubble.row - current.row) <= 1 &&
            Math.abs(bubble.col - current.col) <= 1 &&
            Math.sqrt(
              (bubble.x - current.x) ** 2 + (bubble.y - current.y) ** 2,
            ) < 50,
        );

        toCheck.push(...neighbors);
      }
    }

    return connected;
  };

  const clearAll = () => {
    setBubbles([]);
    setScore(0);
    initializeBubbles();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-purple-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Bubble Shooter</h3>

      {/* Game Area */}
      <div
        className="relative border-2 border-gray-600 rounded-lg bg-gradient-to-b from-blue-200 to-purple-200 cursor-crosshair"
        style={{ width: "500px", height: "400px" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          shootBubble(e.clientX - rect.left, e.clientY - rect.top);
        }}
      >
        {/* Bubbles */}
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute w-8 h-8 flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
            }}
          >
            {bubble.color}
          </div>
        ))}

        {/* Shooter */}
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          style={{
            transform: `translateX(-50%) rotate(${shooterAngle}deg)`,
          }}
        >
          <div className="text-4xl">{currentColor}</div>
          <div className="w-1 h-8 bg-gray-600 mx-auto"></div>
        </div>

        {/* Aim line */}
        <div
          className="absolute bottom-12 left-1/2 w-0.5 h-20 bg-red-300 origin-bottom pointer-events-none"
          style={{
            transform: `translateX(-50%) rotate(${shooterAngle}deg)`,
          }}
        ></div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span>Current:</span>
          <div className="text-3xl">{currentColor}</div>
        </div>
        <div className="flex items-center space-x-2">
          <span>Next:</span>
          <div className="text-3xl">{nextColor}</div>
        </div>
      </div>

      <div className="mt-4 space-x-4">
        <label className="block text-sm font-medium mb-2">
          Aim Direction: {shooterAngle}°
        </label>
        <input
          type="range"
          min="-45"
          max="45"
          value={shooterAngle}
          onChange={(e) => setShooterAngle(Number(e.target.value))}
          className="w-full max-w-xs"
        />
      </div>

      <button
        onClick={clearAll}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        New Game
      </button>

      <div className="mt-4 text-center">
        <p className="text-2xl font-bold">Score: {score}</p>
        <p className="text-sm text-gray-600">
          Click to shoot bubbles! Match 3+ of the same color to pop them.
        </p>
      </div>
    </div>
  );
}
