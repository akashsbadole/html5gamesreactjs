import { useEffect, useRef, useState } from "react";
import { GameProps } from "./GameEngine";

export default function TestGame({ width = 400, height = 300 }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let ballX = 50;
    let ballY = 50;
    let ballVx = 2;
    let ballVy = 2;
    let ballRadius = 20;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update ball position
      ballX += ballVx;
      ballY += ballVy;

      // Bounce off walls
      if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
        ballVx *= -1;
        setScore((prev) => prev + 1);
      }
      if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballVy *= -1;
        setScore((prev) => prev + 1);
      }

      // Draw ball
      ctx.fillStyle = "#e74c3c";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw score
      ctx.fillStyle = "#fff";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);

      // Draw instructions
      ctx.font = "14px Arial";
      ctx.fillText("Click to toggle pause", 10, canvas.height - 10);

      animationId = requestAnimationFrame(gameLoop);
    };

    const handleClick = () => {
      setIsRunning((prev) => !prev);
    };

    canvas.addEventListener("click", handleClick);

    if (isRunning) {
      gameLoop();
    }

    return () => {
      canvas.removeEventListener("click", handleClick);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [score, isRunning]);

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-lg font-bold mb-2">Test Game - Bouncing Ball</h3>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-100"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          Status: {isRunning ? "Running" : "Paused"}
        </p>
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isRunning ? "Pause" : "Start"} Game
        </button>
      </div>
    </div>
  );
}
