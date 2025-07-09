import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

interface Shape {
  id: number;
  type: "cube" | "sphere" | "pyramid" | "cylinder";
  targetColor: string;
  currentColor: string | null;
  x: number;
  y: number;
  size: number;
  completed: boolean;
  rotation: number;
}

const COLORS = [
  { name: "Red", value: "#ff6b6b", emoji: "🔴" },
  { name: "Blue", value: "#4ecdc4", emoji: "🔵" },
  { name: "Green", value: "#45b7d1", emoji: "🟢" },
  { name: "Yellow", value: "#feca57", emoji: "🟡" },
  { name: "Purple", value: "#ff9ff3", emoji: "🟣" },
  { name: "Orange", value: "#ff9500", emoji: "🟠" },
];

const SHAPE_EMOJIS = {
  cube: "⬜",
  sphere: "⚪",
  pyramid: "🔺",
  cylinder: "🟩",
};

export default function ColorFill3D({ onScore }: GameProps) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].value);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<
    "playing" | "completed" | "timeUp"
  >("playing");

  const generateShapes = (levelNum: number) => {
    const shapeCount = 4 + levelNum * 2;
    const newShapes: Shape[] = [];

    for (let i = 0; i < shapeCount; i++) {
      const shapeTypes: (keyof typeof SHAPE_EMOJIS)[] = [
        "cube",
        "sphere",
        "pyramid",
        "cylinder",
      ];
      const randomShape =
        shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

      newShapes.push({
        id: i,
        type: randomShape,
        targetColor: randomColor.value,
        currentColor: null,
        x: 50 + (i % 4) * 120,
        y: 50 + Math.floor(i / 4) * 120,
        size: 80 + Math.random() * 40,
        completed: false,
        rotation: Math.random() * 360,
      });
    }

    setShapes(newShapes);
  };

  useEffect(() => {
    generateShapes(level);
  }, [level]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("timeUp");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Rotation animation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setShapes((prev) =>
        prev.map((shape) => ({
          ...shape,
          rotation: (shape.rotation + 1) % 360,
        })),
      );
    }, 50);

    return () => clearInterval(rotationInterval);
  }, []);

  const fillShape = (shapeId: number) => {
    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id === shapeId && !shape.completed) {
          const newShape = { ...shape, currentColor: selectedColor };

          if (selectedColor === shape.targetColor) {
            newShape.completed = true;
            setScore((prevScore) => {
              const newScore = prevScore + 100;
              onScore?.(newScore);
              return newScore;
            });
          }

          return newShape;
        }
        return shape;
      }),
    );
  };

  // Check level completion
  useEffect(() => {
    if (shapes.length > 0 && shapes.every((shape) => shape.completed)) {
      setGameState("completed");
    }
  }, [shapes]);

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setTimeLeft(60 + level * 10);
    setGameState("playing");
    generateShapes(level + 1);
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(60);
    setGameState("playing");
    generateShapes(1);
  };

  const getShapeStyle = (shape: Shape) => {
    const baseStyle = {
      position: "absolute" as const,
      left: `${shape.x}px`,
      top: `${shape.y}px`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      transform: `rotate(${shape.rotation}deg)`,
      transition: "all 0.3s ease",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "3rem",
      borderRadius: shape.type === "sphere" ? "50%" : "10%",
      border: shape.completed ? "4px solid gold" : "2px solid #ccc",
      backgroundColor: shape.currentColor || "#f0f0f0",
      boxShadow: shape.completed
        ? "0 0 20px gold"
        : "0 4px 8px rgba(0,0,0,0.3)",
    };

    return baseStyle;
  };

  const getTargetColorEmoji = (colorValue: string) => {
    const color = COLORS.find((c) => c.value === colorValue);
    return color ? color.emoji : "⚪";
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-100 to-purple-200 rounded-lg">
      <h3 className="text-2xl font-bold mb-4 text-purple-800">Color Fill 3D</h3>

      {/* Stats */}
      <div className="flex gap-6 mb-4 text-lg font-semibold text-purple-800">
        <div>Level: {level}</div>
        <div>Score: {score}</div>
        <div>Time: {timeLeft}s</div>
        <div>
          Progress: {shapes.filter((s) => s.completed).length}/{shapes.length}
        </div>
      </div>

      {/* Color Palette */}
      <div className="mb-6">
        <div className="text-sm font-medium mb-2 text-purple-700">
          Select Color:
        </div>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`w-12 h-12 rounded-lg border-4 transition-all ${
                selectedColor === color.value
                  ? "border-black scale-110"
                  : "border-gray-400"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {color.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Game Area */}
      <div
        className="relative border-4 border-purple-600 rounded-lg bg-gradient-to-br from-sky-100 to-purple-100"
        style={{ width: "600px", height: "400px" }}
      >
        {shapes.map((shape) => (
          <div key={shape.id}>
            {/* Shape */}
            <div
              style={getShapeStyle(shape)}
              onClick={() => fillShape(shape.id)}
              className="hover:scale-110"
            >
              {SHAPE_EMOJIS[shape.type]}
            </div>

            {/* Target color indicator */}
            <div
              className="absolute text-lg"
              style={{
                left: `${shape.x + shape.size - 20}px`,
                top: `${shape.y - 25}px`,
                pointerEvents: "none",
              }}
            >
              {getTargetColorEmoji(shape.targetColor)}
            </div>

            {/* Completion indicator */}
            {shape.completed && (
              <div
                className="absolute text-2xl animate-bounce"
                style={{
                  left: `${shape.x + shape.size / 2 - 15}px`,
                  top: `${shape.y + shape.size / 2 - 15}px`,
                  pointerEvents: "none",
                }}
              >
                ✨
              </div>
            )}
          </div>
        ))}

        {/* Level completion overlay */}
        {gameState === "completed" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🎉</div>
              <div className="text-2xl font-bold mb-4 text-purple-800">
                Level Complete!
              </div>
              <button
                onClick={nextLevel}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 font-bold"
              >
                Next Level
              </button>
            </div>
          </div>
        )}

        {/* Time up overlay */}
        {gameState === "timeUp" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">⏰</div>
              <div className="text-2xl font-bold mb-4 text-red-600">
                Time's Up!
              </div>
              <div className="mb-4">Final Score: {score}</div>
              <button
                onClick={restartGame}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-purple-700 max-w-md">
        <p className="mb-2">
          🎨 <strong>How to play:</strong>
        </p>
        <p className="mb-1">• Select a color from the palette above</p>
        <p className="mb-1">• Click on shapes to fill them with the color</p>
        <p className="mb-1">
          • Match the target color (shown in top-right corner)
        </p>
        <p>• Complete all shapes before time runs out!</p>
      </div>
    </div>
  );
}
