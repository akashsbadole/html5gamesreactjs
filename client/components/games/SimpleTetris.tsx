import { useEffect, useRef, useState, useCallback } from "react";
import { GameProps } from "./GameEngine";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 20;

const TETROMINOS = [
  { shape: [[1, 1, 1, 1]], color: "#00f0f0" }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  }, // O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  }, // T
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00f000",
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f00000",
  }, // Z
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#f0a000",
  }, // J
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#0000f0",
  }, // L
];

export default function SimpleTetris({
  width = 240,
  height = 480,
  onScore,
  onGameOver,
}: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing");
  const [board, setBoard] = useState<string[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill("")),
  );
  const [currentPiece, setCurrentPiece] = useState(() => ({
    ...TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)],
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
  }));

  const drawBlock = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      ctx.strokeStyle = "#333";
      ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    },
    [],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          drawBlock(ctx, x, y, board[y][x]);
        }
      }
    }

    // Draw current piece
    currentPiece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          drawBlock(
            ctx,
            currentPiece.x + dx,
            currentPiece.y + dy,
            currentPiece.color,
          );
        }
      });
    });

    // Draw UI
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, canvas.height + 20);
    ctx.fillText(`Lines: ${lines}`, 10, canvas.height + 40);
  }, [board, currentPiece, score, lines, drawBlock]);

  const isValidMove = useCallback(
    (piece: any, dx: number, dy: number) => {
      return piece.shape.every((row: number[], py: number) =>
        row.every((value: number, px: number) => {
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

  const clearLines = useCallback(() => {
    const newBoard = board.filter((row) => row.some((cell) => !cell));
    const linesCleared = BOARD_HEIGHT - newBoard.length;

    if (linesCleared > 0) {
      const emptyRows = Array(linesCleared)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(""));

      setBoard([...emptyRows, ...newBoard]);
      setLines((prev) => prev + linesCleared);
      setScore((prev) => {
        const newScore = prev + linesCleared * 100;
        onScore?.(newScore);
        return newScore;
      });
    }
  }, [board, onScore]);

  const placePiece = useCallback(() => {
    const newBoard = [...board];
    currentPiece.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const x = currentPiece.x + dx;
          const y = currentPiece.y + dy;
          if (y >= 0) {
            newBoard[y][x] = currentPiece.color;
          }
        }
      });
    });

    setBoard(newBoard);

    // Check game over
    if (currentPiece.y <= 0) {
      setGameState("gameOver");
      onGameOver?.();
      return;
    }

    // Get new piece
    setCurrentPiece({
      ...TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)],
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    });

    // Clear lines after placing piece
    setTimeout(clearLines, 100);
  }, [board, currentPiece, onGameOver, clearLines]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== "playing") return;

      if (isValidMove(currentPiece, dx, dy)) {
        setCurrentPiece((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      } else if (dy > 0) {
        placePiece();
      }
    },
    [currentPiece, isValidMove, placePiece, gameState],
  );

  const rotatePiece = useCallback(() => {
    if (gameState !== "playing") return;

    const rotated = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map((row) => row[index]).reverse(),
    );

    const rotatedPiece = { ...currentPiece, shape: rotated };

    if (isValidMove(rotatedPiece, 0, 0)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, isValidMove, gameState]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      movePiece(0, 1);
    }, 500);

    return () => clearInterval(gameLoop);
  }, [movePiece]);

  // Draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
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
          rotatePiece();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [movePiece, rotatePiece]);

  const resetGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill("")),
    );
    setCurrentPiece({
      ...TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)],
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    });
    setScore(0);
    setLines(0);
    setGameState("playing");
  };

  return (
    <div className="flex flex-col items-center p-4">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-600 rounded-lg bg-black"
        style={{ width: `${width}px`, height: `${height}px` }}
        tabIndex={0}
      />
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">Score: {score}</p>
        <p className="text-sm">Lines: {lines}</p>
        {gameState === "gameOver" && (
          <div className="mt-2">
            <p className="text-red-500 font-bold">Game Over!</p>
            <button
              onClick={resetGame}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        )}
        <p className="text-xs text-gray-600 mt-2">
          A/D: Move, S: Drop, W/Space: Rotate
        </p>
      </div>
    </div>
  );
}
