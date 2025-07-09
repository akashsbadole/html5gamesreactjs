import { useState, useEffect, useCallback } from "react";
import { GameProps } from "./GameEngine";

interface Flower {
  id: number;
  type: string;
  bloomed: boolean;
  growing: boolean;
}

const FLOWER_TYPES = ["🌸", "🌺", "🌻", "🌷", "🌹", "🌼"];
const GRID_SIZE = 8;

export default function GardenBloom({ onScore }: GameProps) {
  const [grid, setGrid] = useState<Flower[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(1000);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [bloomedCount, setBoomedCount] = useState(0);

  const createFlower = useCallback((id: number): Flower => {
    return {
      id,
      type: FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
      bloomed: false,
      growing: false,
    };
  }, []);

  const initializeGrid = useCallback(() => {
    const newGrid: Flower[][] = [];
    let id = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = createFlower(id++);
      }
    }

    setGrid(newGrid);
  }, [createFlower]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const findMatches = useCallback((testGrid: Flower[][]): number[][] => {
    const matches: number[][] = [];
    const visited = new Set<string>();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      let currentType = testGrid[row][0].type;
      let matchStart = 0;

      for (let col = 1; col <= GRID_SIZE; col++) {
        const flower = col < GRID_SIZE ? testGrid[row][col] : null;

        if (!flower || flower.type !== currentType) {
          if (col - matchStart >= 3) {
            for (let i = matchStart; i < col; i++) {
              if (!visited.has(`${row}-${i}`)) {
                matches.push([row, i]);
                visited.add(`${row}-${i}`);
              }
            }
          }
          if (flower) {
            currentType = flower.type;
            matchStart = col;
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      let currentType = testGrid[0][col].type;
      let matchStart = 0;

      for (let row = 1; row <= GRID_SIZE; row++) {
        const flower = row < GRID_SIZE ? testGrid[row][col] : null;

        if (!flower || flower.type !== currentType) {
          if (row - matchStart >= 3) {
            for (let i = matchStart; i < row; i++) {
              if (!visited.has(`${i}-${col}`)) {
                matches.push([i, col]);
                visited.add(`${i}-${col}`);
              }
            }
          }
          if (flower) {
            currentType = flower.type;
            matchStart = row;
          }
        }
      }
    }

    return matches;
  }, []);

  const bloomFlowers = useCallback(
    (matches: number[][]) => {
      if (matches.length === 0) return;

      setGrid((prevGrid) =>
        prevGrid.map((row, rowIndex) =>
          row.map((flower, colIndex) => {
            const isMatch = matches.some(
              ([r, c]) => r === rowIndex && c === colIndex,
            );
            if (isMatch) {
              return { ...flower, bloomed: true, growing: true };
            }
            return flower;
          }),
        ),
      );

      setBoomedCount((prev) => prev + matches.length);
      setScore((prev) => {
        const newScore = prev + matches.length * 50;
        onScore?.(newScore);
        return newScore;
      });

      // Spread bloom to adjacent flowers
      setTimeout(() => {
        setGrid((prevGrid) =>
          prevGrid.map((row, rowIndex) =>
            row.map((flower, colIndex) => {
              if (flower.bloomed) return flower;

              const hasBloomedNeighbor = matches.some(([r, c]) => {
                const distance =
                  Math.abs(r - rowIndex) + Math.abs(c - colIndex);
                return distance === 1;
              });

              if (hasBloomedNeighbor && Math.random() > 0.5) {
                return { ...flower, bloomed: true, growing: true };
              }

              return flower;
            }),
          ),
        );
      }, 500);

      // Stop growing animation
      setTimeout(() => {
        setGrid((prevGrid) =>
          prevGrid.map((row) =>
            row.map((flower) => ({ ...flower, growing: false })),
          ),
        );
      }, 1000);
    },
    [onScore],
  );

  const swapFlowers = useCallback(
    (row1: number, col1: number, row2: number, col2: number) => {
      const newGrid = grid.map((row) => [...row]);
      const temp = newGrid[row1][col1];
      newGrid[row1][col1] = newGrid[row2][col2];
      newGrid[row2][col2] = temp;

      // Check if this swap creates matches
      const matches = findMatches(newGrid);

      if (matches.length > 0) {
        setGrid(newGrid);
        setMoves((prev) => prev - 1);
        setTimeout(() => bloomFlowers(matches), 100);
      }
      // If no matches, swap back (invalid move)
      else {
        // Visual feedback for invalid move
        setTimeout(() => {
          setSelectedCell(null);
        }, 200);
      }
    },
    [grid, findMatches, bloomFlowers],
  );

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "playing") return;

    if (selectedCell) {
      const { row: selectedRow, col: selectedCol } = selectedCell;

      // Check if clicked cell is adjacent
      const isAdjacent =
        Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1;

      if (isAdjacent) {
        swapFlowers(selectedRow, selectedCol, row, col);
      }

      setSelectedCell(null);
    } else {
      setSelectedCell({ row, col });
    }
  };

  // Check win/lose conditions
  useEffect(() => {
    if (score >= targetScore) {
      setGameState("won");
    } else if (moves <= 0) {
      setGameState("lost");
    }
  }, [score, moves, targetScore]);

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setTargetScore((prev) => prev + 500);
    setMoves(30);
    setScore(0);
    setBoomedCount(0);
    setGameState("playing");
    initializeGrid();
  };

  const restartLevel = () => {
    setMoves(30);
    setScore(0);
    setBoomedCount(0);
    setGameState("playing");
    initializeGrid();
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-green-100 to-green-300 rounded-lg">
      <h3 className="text-2xl font-bold mb-4 text-green-800">Garden Bloom</h3>

      {/* Stats */}
      <div className="flex gap-6 mb-4 text-lg font-semibold text-green-800">
        <div>Level: {level}</div>
        <div>Score: {score}</div>
        <div>Target: {targetScore}</div>
        <div>Moves: {moves}</div>
        <div>Bloomed: {bloomedCount}</div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-8 gap-1 p-4 bg-brown-200 rounded-lg border-4 border-brown-400">
        {grid.map((row, rowIndex) =>
          row.map((flower, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`
                w-12 h-12 border-2 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-2xl
                ${
                  flower.bloomed
                    ? "bg-gradient-to-b from-yellow-200 to-yellow-400 border-yellow-500 shadow-lg"
                    : "bg-gradient-to-b from-green-200 to-green-400 border-green-500"
                }
                ${
                  selectedCell?.row === rowIndex &&
                  selectedCell?.col === colIndex
                    ? "ring-4 ring-blue-400 transform scale-110"
                    : "hover:scale-105"
                }
                ${flower.growing ? "animate-pulse" : ""}
              `}
            >
              <div className={flower.bloomed ? "animate-bounce" : ""}>
                {flower.type}
              </div>
            </div>
          )),
        )}
      </div>

      {/* Game State Messages */}
      {gameState === "won" && (
        <div className="mt-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-2xl font-bold text-green-600 mb-4">
            Garden Bloomed!
          </div>
          <button
            onClick={nextLevel}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-bold"
          >
            Next Level
          </button>
        </div>
      )}

      {gameState === "lost" && (
        <div className="mt-6 text-center">
          <div className="text-4xl mb-2">😢</div>
          <div className="text-2xl font-bold text-red-600 mb-4">
            Garden Withered!
          </div>
          <button
            onClick={restartLevel}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-green-700 max-w-md">
        <p className="mb-2">
          🌱 <strong>How to play:</strong>
        </p>
        <p className="mb-1">• Click two adjacent flowers to swap them</p>
        <p className="mb-1">• Match 3+ of the same flower to make them bloom</p>
        <p className="mb-1">• Bloomed flowers spread to nearby flowers</p>
        <p>• Reach the target score before running out of moves!</p>
      </div>
    </div>
  );
}
