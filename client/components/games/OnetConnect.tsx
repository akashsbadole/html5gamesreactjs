import { useState, useCallback } from "react";
import { GameProps } from "./GameEngine";

interface Tile {
  id: string;
  symbol: string;
  x: number;
  y: number;
  matched: boolean;
  color: string;
}

export default function OnetConnect({ onScore, onGameOver }: GameProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing");

  const symbols = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];
  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff6348",
  ];

  const initializeGame = useCallback(() => {
    const newTiles: Tile[] = [];
    const pairs = 20; // 40 tiles total

    // Create pairs of tiles
    for (let i = 0; i < pairs; i++) {
      const symbol = symbols[i % symbols.length];
      const color = colors[i % colors.length];

      // Create two identical tiles
      for (let j = 0; j < 2; j++) {
        newTiles.push({
          id: `${i}-${j}`,
          symbol,
          color,
          x: 0,
          y: 0,
          matched: false,
        });
      }
    }

    // Shuffle and position tiles
    const shuffled = newTiles.sort(() => Math.random() - 0.5);
    const gridWidth = 10;
    const gridHeight = 4;

    shuffled.forEach((tile, index) => {
      tile.x = index % gridWidth;
      tile.y = Math.floor(index / gridWidth);
    });

    setTiles(shuffled);
    setSelectedTiles([]);
    setScore(0);
    setTimeLeft(300);
    setGameState("playing");
  }, []);

  useState(() => {
    initializeGame();
  });

  // Timer
  useState(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("gameOver");
            onGameOver?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  });

  const canConnect = (tile1: Tile, tile2: Tile): boolean => {
    // Simple connection logic - tiles can connect if there's a clear path
    // For simplicity, we'll allow connection if tiles are in the same row/column
    // or if there's no obstacle in a simple L-shaped path

    if (tile1.x === tile2.x) {
      // Same column - check vertical path
      const minY = Math.min(tile1.y, tile2.y);
      const maxY = Math.max(tile1.y, tile2.y);
      for (let y = minY + 1; y < maxY; y++) {
        const obstacle = tiles.find(
          (t) => t.x === tile1.x && t.y === y && !t.matched,
        );
        if (obstacle) return false;
      }
      return true;
    }

    if (tile1.y === tile2.y) {
      // Same row - check horizontal path
      const minX = Math.min(tile1.x, tile2.x);
      const maxX = Math.max(tile1.x, tile2.x);
      for (let x = minX + 1; x < maxX; x++) {
        const obstacle = tiles.find(
          (t) => t.x === x && t.y === tile1.y && !t.matched,
        );
        if (obstacle) return false;
      }
      return true;
    }

    // L-shaped path (simplified)
    // Check if we can go horizontally then vertically or vice versa
    const corner1 = { x: tile1.x, y: tile2.y };
    const corner2 = { x: tile2.x, y: tile1.y };

    // Check path via corner1
    const pathViaConer1Clear =
      !tiles.find(
        (t) => t.x === corner1.x && t.y === corner1.y && !t.matched,
      ) &&
      canConnect(tile1, { ...tile1, x: corner1.x, y: corner1.y }) &&
      canConnect({ ...tile2, x: corner1.x, y: corner1.y }, tile2);

    // Check path via corner2
    const pathViaConer2Clear =
      !tiles.find(
        (t) => t.x === corner2.x && t.y === corner2.y && !t.matched,
      ) &&
      canConnect(tile1, { ...tile1, x: corner2.x, y: corner2.y }) &&
      canConnect({ ...tile2, x: corner2.x, y: corner2.y }, tile2);

    return pathViaConer1Clear || pathViaConer2Clear;
  };

  const handleTileClick = (clickedTile: Tile) => {
    if (clickedTile.matched || gameState !== "playing") return;

    if (selectedTiles.length === 0) {
      setSelectedTiles([clickedTile]);
    } else if (selectedTiles.length === 1) {
      const firstTile = selectedTiles[0];

      if (firstTile.id === clickedTile.id) {
        // Clicked same tile - deselect
        setSelectedTiles([]);
      } else if (
        firstTile.symbol === clickedTile.symbol &&
        canConnect(firstTile, clickedTile)
      ) {
        // Match found!
        setTiles((prev) =>
          prev.map((tile) =>
            tile.id === firstTile.id || tile.id === clickedTile.id
              ? { ...tile, matched: true }
              : tile,
          ),
        );

        setScore((prev) => {
          const newScore = prev + 100;
          onScore?.(newScore);
          return newScore;
        });

        setSelectedTiles([]);

        // Check win condition
        setTimeout(() => {
          const allMatched = tiles.every(
            (t) =>
              t.matched || t.id === firstTile.id || t.id === clickedTile.id,
          );
          if (allMatched) {
            setGameState("gameOver");
            onGameOver?.();
          }
        }, 100);
      } else {
        // No match - select the new tile
        setSelectedTiles([clickedTile]);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const Tile = ({ tile }: { tile: Tile }) => (
    <div
      className={`
        w-12 h-12 border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center
        ${
          tile.matched
            ? "opacity-30 cursor-not-allowed border-gray-300"
            : selectedTiles.some((t) => t.id === tile.id)
              ? "border-yellow-400 bg-yellow-100 scale-110"
              : "border-gray-400 hover:border-blue-400 hover:scale-105"
        }
      `}
      style={{
        backgroundColor: tile.matched ? "#f5f5f5" : tile.color + "40",
        gridColumn: tile.x + 1,
        gridRow: tile.y + 1,
      }}
      onClick={() => handleTileClick(tile)}
    >
      <span className={`text-xl ${tile.matched ? "grayscale" : ""}`}>
        {tile.symbol}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg min-h-[600px]">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          Onet Connect Classic
        </h2>
        <div className="flex gap-6 text-lg">
          <span className="text-purple-700">Score: {score}</span>
          <span
            className={`${timeLeft < 60 ? "text-red-600 font-bold" : "text-purple-700"}`}
          >
            Time: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div
        className="grid gap-1 p-4 bg-white rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: "repeat(10, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
        }}
      >
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-purple-700 max-w-md">
        <p className="mb-2">
          🎯 <strong>How to play:</strong>
        </p>
        <p className="mb-1">• Click two identical tiles to connect them</p>
        <p className="mb-1">
          • Tiles can connect with straight or L-shaped paths
        </p>
        <p className="mb-1">• Clear all tiles before time runs out</p>
        <p>• Plan your moves carefully - some tiles may block others!</p>
      </div>

      {gameState === "gameOver" && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-purple-800">
            {tiles.every((t) => t.matched) ? "Congratulations!" : "Time's Up!"}
          </h3>
          <p className="text-purple-700">Final Score: {score}</p>
          <button
            onClick={initializeGame}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
