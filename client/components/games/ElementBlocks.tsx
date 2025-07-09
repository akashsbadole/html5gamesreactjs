import { useState, useEffect, useCallback } from "react";
import { GameProps } from "./GameEngine";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 25;

const TETROMINOS = [
  { shape: [[1, 1, 1, 1]], color: "🔥", name: "Fire" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "💧",
    name: "Water",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "🌿",
    name: "Earth",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "⚡",
    name: "Lightning",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "❄️",
    name: "Ice",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "🌙",
    name: "Dark",
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "☀️",
    name: "Light",
  },
];

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
  name: string;
}

export default function ElementBlocks({ onScore }: GameProps) {
  const [board, setBoard] = useState<string[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill("")),
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"playing" | "paused" | "gameOver">(
    "playing",
  );
  const [dropTime, setDropTime] = useState(1000);

  const createPiece = useCallback((): Piece => {
    const template = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    return {
      shape: template.shape,
      color: template.color,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      name: template.name,
    };
  }, []);

  useEffect(() => {
    setCurrentPiece(createPiece());
    setNextPiece(createPiece());
  }, [createPiece]);

  const isValidMove = useCallback(
    (piece: Piece, dx: number, dy: number, shape?: number[][]) => {
      const testShape = shape || piece.shape;
      return testShape.every((row, py) =>
        row.every((value, px) => {
          const newX = piece.x + px + dx;
          const newY = piece.y + py + dy;
          return (
            value === 0 ||
            (newX >= 0 &&
              newX < BOARD_WIDTH &&
              newY >= 0 &&
              newY < BOARD_HEIGHT &&
              !board[newY][newX])
          );
        }),
      );
    },
    [board],
  );

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    return piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse(),
    );
  }, []);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map((row) => [...row]);
    currentPiece.shape.forEach((row, py) => {
      row.forEach((value, px) => {
        if (value) {
          const x = currentPiece.x + px;
          const y = currentPiece.y + py;
          if (y >= 0) {
            newBoard[y][x] = currentPiece.color;
          }
        }
      });
    });

    setBoard(newBoard);

    // Check for complete lines
    const fullLines: number[] = [];
    newBoard.forEach((row, index) => {
      if (row.every((cell) => cell !== "")) {
        fullLines.push(index);
      }
    });

    if (fullLines.length > 0) {
      // Remove full lines and add empty lines at top
      const filteredBoard = newBoard.filter(
        (_, index) => !fullLines.includes(index),
      );
      const emptyLines = Array(fullLines.length)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(""));
      const finalBoard = [...emptyLines, ...filteredBoard];

      setBoard(finalBoard);
      setLines((prev) => prev + fullLines.length);
      setScore((prev) => {
        const lineScore = fullLines.length * 100 * level;
        const newScore = prev + lineScore;
        onScore?.(newScore);
        return newScore;
      });

      // Level up every 10 lines
      if (
        Math.floor((lines + fullLines.length) / 10) > Math.floor(lines / 10)
      ) {
        setLevel((prev) => prev + 1);
        setDropTime((prev) => Math.max(100, prev - 50));
      }
    }

    // Check game over
    if (currentPiece.y <= 1) {
      setGameState("gameOver");
      return;
    }

    // Get new piece
    setCurrentPiece(nextPiece);
    setNextPiece(createPiece());
  }, [currentPiece, board, lines, level, onScore, nextPiece, createPiece]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameState !== "playing") return;

      if (isValidMove(currentPiece, dx, dy)) {
        setCurrentPiece((prev) =>
          prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null,
        );
      } else if (dy > 0) {
        placePiece();
      }
    },
    [currentPiece, isValidMove, placePiece, gameState],
  );

  const rotatePieceAction = useCallback(() => {
    if (!currentPiece || gameState !== "playing") return;

    const rotatedShape = rotatePiece(currentPiece);
    if (isValidMove(currentPiece, 0, 0, rotatedShape)) {
      setCurrentPiece((prev) =>
        prev ? { ...prev, shape: rotatedShape } : null,
      );
    }
  }, [currentPiece, rotatePiece, isValidMove, gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = setInterval(() => {
      movePiece(0, 1);
    }, dropTime);

    return () => clearInterval(gameLoop);
  }, [movePiece, dropTime, gameState]);

  // Controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== "playing") return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          movePiece(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          movePiece(1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          movePiece(0, 1);
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          rotatePieceAction();
          break;
        case "p":
        case "P":
          setGameState((prev) => (prev === "playing" ? "paused" : "playing"));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [movePiece, rotatePieceAction, gameState]);

  const resetGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill("")),
    );
    setCurrentPiece(createPiece());
    setNextPiece(createPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(1000);
    setGameState("playing");
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-900 to-blue-900 rounded-lg text-white">
      <h3 className="text-2xl font-bold mb-4">Element Blocks</h3>

      <div className="flex gap-6">
        {/* Game Board */}
        <div className="relative">
          <div
            className="grid border-2 border-gray-400 bg-black"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`,
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${BLOCK_SIZE}px)`,
            }}
          >
            {/* Board cells */}
            {board.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="border border-gray-600 flex items-center justify-center text-sm"
                  style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                >
                  {cell}
                </div>
              )),
            )}
          </div>

          {/* Current piece overlay */}
          {currentPiece && gameState === "playing" && (
            <div className="absolute top-0 left-0 pointer-events-none">
              {currentPiece.shape.map((row, py) =>
                row.map((value, px) =>
                  value ? (
                    <div
                      key={`current-${px}-${py}`}
                      className="absolute flex items-center justify-center text-sm bg-white bg-opacity-20 border border-white"
                      style={{
                        left: (currentPiece.x + px) * BLOCK_SIZE,
                        top: (currentPiece.y + py) * BLOCK_SIZE,
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                      }}
                    >
                      {currentPiece.color}
                    </div>
                  ) : null,
                ),
              )}
            </div>
          )}

          {/* Game state overlay */}
          {gameState === "paused" && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-4xl font-bold">PAUSED</div>
            </div>
          )}
          {gameState === "gameOver" && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center flex-col">
              <div className="text-4xl font-bold mb-4">GAME OVER</div>
              <button
                onClick={resetGame}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-xl font-bold">Score: {score}</div>
            <div>Lines: {lines}</div>
            <div>Level: {level}</div>
          </div>

          {/* Next Piece */}
          <div className="bg-gray-800 p-4 rounded">
            <div className="font-bold mb-2">Next Element:</div>
            {nextPiece && (
              <div>
                <div className="text-lg mb-1">{nextPiece.name}</div>
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: `repeat(4, 20px)` }}
                >
                  {Array(4)
                    .fill(null)
                    .map((_, y) =>
                      Array(4)
                        .fill(null)
                        .map((_, x) => {
                          const hasBlock =
                            nextPiece.shape[y] && nextPiece.shape[y][x];
                          return (
                            <div
                              key={`next-${x}-${y}`}
                              className="w-5 h-5 border border-gray-600 flex items-center justify-center text-xs"
                            >
                              {hasBlock ? nextPiece.color : ""}
                            </div>
                          );
                        }),
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-4 rounded text-sm">
            <div className="font-bold mb-2">Controls:</div>
            <div>A/D: Move left/right</div>
            <div>S: Soft drop</div>
            <div>W/Space: Rotate</div>
            <div>P: Pause</div>
          </div>
        </div>
      </div>
    </div>
  );
}
