import { useEffect, useRef, useState, useCallback } from "react";
import { GameProps } from "./GameEngine";

interface Position {
  x: number;
  y: number;
}

export default function SimpleSnake({
  width = 400,
  height = 400,
  onScore,
  onGameOver,
}: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing");
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });

  const gridSize = 20;
  const tileCount = width / gridSize;

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  }, [tileCount]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = "#4CAF50";
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = "#8BC34A";
      } else {
        ctx.fillStyle = "#4CAF50";
      }
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2,
      );
    });

    // Draw food
    ctx.fillStyle = "#FF5722";
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      2 * Math.PI,
    );
    ctx.fill();

    // Draw score
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 25);
  }, [snake, food, score, gameState, tileCount, gridSize]);

  const moveSnake = useCallback(() => {
    if (gameState !== "playing") return;

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
      ) {
        setGameState("gameOver");
        onGameOver?.();
        return currentSnake;
      }

      // Check self collision
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameState("gameOver");
        onGameOver?.();
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10;
          onScore?.(newScore);
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [
    direction,
    food,
    gameState,
    tileCount,
    onScore,
    onGameOver,
    generateFood,
  ]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // Drawing
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  // Controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== "playing") return;

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameState]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setFood(generateFood());
    setScore(0);
    setGameState("playing");
  };

  return (
    <div className="flex flex-col items-center p-4">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-600 rounded-lg bg-gray-900"
        style={{ width: `${width}px`, height: `${height}px` }}
        tabIndex={0}
      />
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">Score: {score}</p>
        {gameState === "gameOver" && (
          <div className="mt-2">
            <p className="text-red-500 font-bold">Game Over!</p>
            <button
              onClick={resetGame}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Play Again
            </button>
          </div>
        )}
        <p className="text-sm text-gray-600 mt-2">
          Use WASD or arrow keys to control the snake
        </p>
      </div>
    </div>
  );
}
